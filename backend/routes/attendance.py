from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from core.auth import require_admin
from core.db import db
from models.attendance import Attendance, AttendanceCreate, AttendanceResponse
from routes.subscriptions import check_and_activate_queued
from services.audit import log_action
from services.email import send_milestone_email

router = APIRouter(tags=['attendance'])

def snap_time(dt: datetime) -> datetime:
    """
    Logica QoL: Snapping.
    10:45 - 10:59 -> 11:00
    11:00 - 11:10 -> 11:00
    11:11 - 11:44 -> 11:30
    """
    minute = dt.minute
    snapped_dt = dt
    
    if 45 <= minute <= 59:
        snapped_dt = (dt + timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)
    elif 0 <= minute <= 10:
        snapped_dt = dt.replace(minute=0, second=0, microsecond=0)
    else: 
        snapped_dt = dt.replace(minute=30, second=0, microsecond=0)

    return snapped_dt

async def get_person_by_token_or_id(qr_token: str = None, person_id: str = None):
    if qr_token:
        user = await db.users.find_one({'qr_token': qr_token, 'marked_for_deletion': False})
        if user:
            return user, user['id'], 'user', user['name']
        user = await db.users.find_one({'children.qr_token': qr_token, 'marked_for_deletion': False})
        if user:
            for child in user['children']:
                if child['qr_token'] == qr_token:
                    return user, child['id'], 'child', child['name']
        raise HTTPException(status_code=404, detail="Cod QR invalid sau utilizator șters.")

    if person_id:
        user = await db.users.find_one({'id': person_id, 'marked_for_deletion': False})
        if user:
            return user, user['id'], 'user', user['name']
        user = await db.users.find_one({'children.id': person_id, 'marked_for_deletion': False})
        if user:
            for child in user['children']:
                if child['id'] == person_id:
                    return user, child['id'], 'child', child['name']
        raise HTTPException(status_code=404, detail="Utilizator negăsit.")
        
    raise HTTPException(status_code=400, detail="Trebuie specificat qr_token sau person_id.")

@router.post('/attendance', response_model=AttendanceResponse)
async def record_attendance(data: AttendanceCreate, admin: dict = Depends(require_admin)):
    user, person_id, person_type, person_name = await get_person_by_token_or_id(data.qr_token, data.person_id)
    now = datetime.now(timezone.utc)

    # QoL: Protectie Anti-Double Scan (60 min)
    last_attendance = await db.attendance.find_one({"person_id": person_id}, sort=[("original_scan_time", -1)])
    if last_attendance:
        last_time = datetime.fromisoformat(last_attendance["original_scan_time"].replace('Z', '+00:00'))
        if (now - last_time).total_seconds() < 3600:
            raise HTTPException(status_code=400, detail="Prezență deja înregistrată în ultimele 60 de minute.")

    await check_and_activate_queued(person_id, person_type)

    active_sub = await db.subscriptions.find_one({'person_id': person_id, 'person_type': person_type, 'status': 'active'})

    if not active_sub:
        raise HTTPException(status_code=400, detail="Persoana nu are niciun abonament activ. Acces Respins.")

    snapped_time = snap_time(now)
    new_used = active_sub.get('sessions_used', 0) + 1
    update_data = {'sessions_used': new_used}
    
    status_changed = False
    if active_sub.get('sessions_total') and new_used >= active_sub['sessions_total']:
        update_data['status'] = 'completed'
        status_changed = True

    await db.subscriptions.update_one({'id': active_sub['id']}, {'$set': update_data})

    if status_changed:
        await check_and_activate_queued(person_id, person_type)

    attendance_record = Attendance(
        user_id=user['id'], person_id=person_id, person_type=person_type, person_name=person_name,
        subscription_id=active_sub['id'], plan_name=active_sub['plan_name'], location=data.location,
        recorded_at=snapped_time.isoformat(), original_scan_time=now.isoformat()
    )

    await db.attendance.insert_one(attendance_record.model_dump())
    
    # QoL: Milestone Celebration & Email
    total_attendance = await db.attendance.count_documents({"person_id": person_id})
    milestone_reached = None
    if total_attendance in [50, 100, 150, 200]:
        milestone_reached = total_attendance
        if user.get("email"):
            try:
                await send_milestone_email(user["email"], person_name, milestone_reached)
            except Exception:
                pass # Ignoram erorile de SMTP ca sa nu blocam check-in-ul

    await log_action(admin["name"], admin["role"], "RECORD_ATTENDANCE", f"Check-in QR pentru {person_name} ({active_sub['plan_name']}).")

    resp_data = attendance_record.model_dump()
    resp_data["milestone_reached"] = milestone_reached
    return AttendanceResponse(**resp_data)


@router.get('/attendance', response_model=List[AttendanceResponse])
async def get_attendance(
    user_id: Optional[str] = None, person_id: Optional[str] = None, 
    start_date: Optional[str] = None, end_date: Optional[str] = None,
    admin: dict = Depends(require_admin)
):
    query = {}
    if user_id: query['user_id'] = user_id
    if person_id: query['person_id'] = person_id
        
    if start_date or end_date:
        date_query = {}
        if start_date: date_query["$gte"] = start_date
        if end_date: date_query["$lte"] = end_date
        query["recorded_at"] = date_query

    records = await db.attendance.find(query, {'_id': 0}).sort('original_scan_time', -1).to_list(1000)
    return [AttendanceResponse(**r, milestone_reached=None) for r in records]


@router.delete('/attendance/{att_id}')
async def delete_attendance(att_id: str, admin: dict = Depends(require_admin)):
    att = await db.attendance.find_one({'id': att_id}, {'_id': 0})
    if not att:
        raise HTTPException(status_code=404, detail="Prezența nu a fost găsită")

    sub_id = att['subscription_id']
    sub = await db.subscriptions.find_one({'id': sub_id})
    
    if not sub:
        await db.attendance.delete_one({'id': att_id})
        return {'message': 'Prezență ștearsă (Abonamentul original nu mai există).'}

    current_used = sub.get('sessions_used', 1)
    new_used = max(0, current_used - 1)
    sub_status = sub['status']
    update_data = {'sessions_used': new_used}

    if sub_status in ['completed', 'expired']:
        update_data['status'] = 'active'
        newer_active_sub = await db.subscriptions.find_one({
            "person_id": att["person_id"], "status": "active", "id": {"$ne": sub_id}
        })
        if newer_active_sub:
            await db.subscriptions.update_one(
                {"id": newer_active_sub["id"]},
                {"$set": {"status": "queued"}, "$unset": {"activated_at": "", "expires_at": ""}}
            )

    await db.subscriptions.update_one({'id': sub_id}, {'$set': update_data})
    await db.attendance.delete_one({'id': att_id})
    await log_action(admin["name"], admin["role"], "UNDO_ATTENDANCE", f"A șters prezența lui {att['person_name']} și a refăcut abonamentele.")

    return {'message': 'Prezență ștearsă, iar abonamentul a fost restaurat.'}