from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from core.auth import require_admin
from core.db import db
from models.attendance import Attendance, AttendanceCreate
from routes.subscriptions import check_and_activate_queued
from services.qr import resolve_person_by_qr_token

router = APIRouter(tags=['attendance'])


@router.get('/attendance')
async def get_attendance(date_from: Optional[str] = None, date_to: Optional[str] = None, location: Optional[str] = None, limit: int = 100, admin: dict = Depends(require_admin)):
    query = {}
    if date_from:
        query['recorded_at'] = {'$gte': date_from}
    if date_to:
        if 'recorded_at' in query:
            query['recorded_at']['$lte'] = date_to
        else:
            query['recorded_at'] = {'$lte': date_to}
    if location:
        query['location'] = location

    records = await db.attendance.find(query, {'_id': 0}).sort('recorded_at', -1).to_list(limit)
    return records


@router.post('/attendance/manual')
async def record_manual_attendance(attendance_list: List[AttendanceCreate], admin: dict = Depends(require_admin)):
    now = datetime.now(timezone.utc)
    today = now.date()

    if today.weekday() == 6:
        raise HTTPException(status_code=400, detail='Prezența nu poate fi înregistrată duminica')

    results = []
    for att in attendance_list:
        if att.person_type == 'user':
            user = await db.users.find_one({'id': att.person_id}, {'_id': 0})
            if not user:
                results.append({'person_id': att.person_id, 'error': 'Utilizator negăsit'})
                continue
            user_id = user['id']
            person_name = user['name']
        else:
            user = await db.users.find_one({'children.id': att.person_id}, {'_id': 0})
            if not user:
                results.append({'person_id': att.person_id, 'error': 'Copil negăsit'})
                continue
            user_id = user['id']
            person_name = next(c['name'] for c in user['children'] if c['id'] == att.person_id)

        today_start = datetime.combine(today, datetime.min.time()).replace(tzinfo=timezone.utc)
        today_end = datetime.combine(today, datetime.max.time()).replace(tzinfo=timezone.utc)
        existing = await db.attendance.find_one({'person_id': att.person_id, 'recorded_at': {'$gte': today_start.isoformat(), '$lte': today_end.isoformat()}})
        if existing:
            results.append({'person_id': att.person_id, 'error': 'Deja prezent astăzi', 'person_name': person_name})
            continue

        await check_and_activate_queued(att.person_id, att.person_type)
        active_sub = await db.subscriptions.find_one({'person_id': att.person_id, 'person_type': att.person_type, 'status': 'active'}, {'_id': 0})
        if not active_sub:
            results.append({'person_id': att.person_id, 'error': 'Fără abonament activ', 'person_name': person_name})
            continue

        if active_sub.get('expires_at'):
            expires = datetime.fromisoformat(active_sub['expires_at'])
            if now > expires:
                await db.subscriptions.update_one({'id': active_sub['id']}, {'$set': {'status': 'expired'}})
                results.append({'person_id': att.person_id, 'error': 'Abonament expirat', 'person_name': person_name})
                continue

        attendance = Attendance(
            user_id=user_id,
            person_id=att.person_id,
            person_type=att.person_type,
            person_name=person_name,
            location=att.location,
            subscription_id=active_sub['id'],
            method=att.method,
            recorded_by=admin['id'],
        )
        await db.attendance.insert_one(attendance.model_dump())
        await db.users.update_one({'id': user_id}, {'$set': {'last_activity': now.isoformat(), 'marked_for_deletion': False}})

        if active_sub.get('sessions_total'):
            new_used = active_sub.get('sessions_used', 0) + 1
            if new_used >= active_sub['sessions_total']:
                await db.subscriptions.update_one({'id': active_sub['id']}, {'$set': {'sessions_used': new_used, 'status': 'completed'}})
                await check_and_activate_queued(att.person_id, att.person_type)
            else:
                await db.subscriptions.update_one({'id': active_sub['id']}, {'$set': {'sessions_used': new_used}})

        results.append({'person_id': att.person_id, 'success': True, 'person_name': person_name})

    return results


@router.post('/attendance/qr')
async def record_qr_attendance(qr_token: str, location: str, admin: dict = Depends(require_admin)):
    now = datetime.now(timezone.utc)
    today = now.date()

    if today.weekday() == 6:
        raise HTTPException(status_code=400, detail='Prezența nu poate fi înregistrată duminica')

    resolved = await resolve_person_by_qr_token(qr_token)
    if not resolved.get('valid'):
        raise HTTPException(status_code=404, detail='Cod QR invalid')

    person_id = resolved['person_id']
    person_type = resolved['person_type']
    person_name = resolved['person_name']
    user_id = resolved['user_id']

    today_start = datetime.combine(today, datetime.min.time()).replace(tzinfo=timezone.utc)
    today_end = datetime.combine(today, datetime.max.time()).replace(tzinfo=timezone.utc)
    existing = await db.attendance.find_one({'person_id': person_id, 'recorded_at': {'$gte': today_start.isoformat(), '$lte': today_end.isoformat()}})
    if existing:
        raise HTTPException(status_code=400, detail=f'{person_name} este deja prezent/ă astăzi')

    await check_and_activate_queued(person_id, person_type)
    active_sub = await db.subscriptions.find_one({'person_id': person_id, 'person_type': person_type, 'status': 'active'}, {'_id': 0})
    if not active_sub:
        raise HTTPException(status_code=400, detail=f'{person_name} nu are abonament activ')

    if active_sub.get('expires_at'):
        expires = datetime.fromisoformat(active_sub['expires_at'])
        if now > expires:
            await db.subscriptions.update_one({'id': active_sub['id']}, {'$set': {'status': 'expired'}})
            raise HTTPException(status_code=400, detail=f'Abonamentul lui {person_name} a expirat')

    sessions_remaining = None
    if active_sub.get('sessions_total'):
        sessions_remaining = active_sub['sessions_total'] - active_sub.get('sessions_used', 0)
        if sessions_remaining <= 0:
            raise HTTPException(status_code=400, detail=f'{person_name} nu mai are ședințe disponibile')

    attendance = Attendance(
        user_id=user_id,
        person_id=person_id,
        person_type=person_type,
        person_name=person_name,
        location=location,
        subscription_id=active_sub['id'],
        method='qr',
        recorded_by=admin['id'],
    )
    await db.attendance.insert_one(attendance.model_dump())
    await db.users.update_one({'id': user_id}, {'$set': {'last_activity': now.isoformat(), 'marked_for_deletion': False}})

    warnings = []
    if active_sub.get('sessions_total'):
        new_used = active_sub.get('sessions_used', 0) + 1
        sessions_remaining = active_sub['sessions_total'] - new_used

        if new_used >= active_sub['sessions_total']:
            await db.subscriptions.update_one({'id': active_sub['id']}, {'$set': {'sessions_used': new_used, 'status': 'completed'}})
            await check_and_activate_queued(person_id, person_type)
            warnings.append('Abonament finalizat - verificați dacă există unul în așteptare')
        else:
            await db.subscriptions.update_one({'id': active_sub['id']}, {'$set': {'sessions_used': new_used}})
            if sessions_remaining <= 2:
                warnings.append(f'Atenție: mai are doar {sessions_remaining} ședințe')

    return {'success': True, 'person_name': person_name, 'person_type': person_type, 'sessions_remaining': sessions_remaining, 'warnings': warnings}


@router.delete('/attendance/{attendance_id}')
async def delete_attendance(attendance_id: str, admin: dict = Depends(require_admin)):
    att = await db.attendance.find_one({'id': attendance_id}, {'_id': 0})
    if not att:
        raise HTTPException(status_code=404, detail='Prezență negăsită')

    sub = await db.subscriptions.find_one({'id': att['subscription_id']}, {'_id': 0})
    await db.attendance.delete_one({'id': attendance_id})

    if sub and sub.get('sessions_total'):
        if sub['status'] == 'completed':
            await db.subscriptions.update_one({'id': sub['id']}, {'$set': {'status': 'active', 'sessions_used': sub['sessions_total'] - 1}})
        else:
            new_used = max(0, sub.get('sessions_used', 0) - 1)
            await db.subscriptions.update_one({'id': sub['id']}, {'$set': {'sessions_used': new_used}})

    return {'message': 'Prezență ștearsă'}
