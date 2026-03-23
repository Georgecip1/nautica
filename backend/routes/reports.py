from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends

from core.auth import get_current_user, require_admin
from core.db import db
from services.alerts import generate_alerts
from services.maintenance import mark_inactive_users_for_deletion

router = APIRouter(tags=['reports'])


@router.get('/alerts')
async def get_alerts(user_id: Optional[str] = None, unseen_only: bool = False, admin: dict = Depends(require_admin)):
    await generate_alerts()
    query = {}
    if user_id:
        query['user_id'] = user_id
    if unseen_only:
        query['is_seen'] = False
    alerts = await db.alerts.find(query, {'_id': 0}).sort('created_at', -1).to_list(500)
    return alerts


@router.get('/alerts/count')
async def get_alerts_count(admin: dict = Depends(require_admin)):
    count = await db.alerts.count_documents({'is_seen': False})
    return {'count': count}


@router.put('/alerts/{alert_id}/seen')
async def mark_alert_seen(alert_id: str, admin: dict = Depends(require_admin)):
    await db.alerts.update_one({'id': alert_id}, {'$set': {'is_seen': True}})
    return {'message': 'Alertă marcată ca văzută'}


@router.put('/alerts/seen-all')
async def mark_all_alerts_seen(admin: dict = Depends(require_admin)):
    await db.alerts.update_many({'is_seen': False}, {'$set': {'is_seen': True}})
    return {'message': 'Toate alertele marcate ca văzute'}


@router.get('/my-alerts')
async def get_my_alerts(user: dict = Depends(get_current_user)):
    alerts = await db.alerts.find({'user_id': user['id']}, {'_id': 0}).sort('created_at', -1).to_list(100)
    return alerts


@router.get('/reports/dashboard')
async def get_dashboard_stats(admin: dict = Depends(require_admin)):
    await mark_inactive_users_for_deletion()
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_users = await db.users.count_documents({'role': 'USER'})
    active_subs = await db.subscriptions.count_documents({'status': 'active'})
    month_subs = await db.subscriptions.find({'purchased_at': {'$gte': month_start.isoformat()}}, {'_id': 0}).to_list(10000)
    monthly_revenue = sum(s.get('price', 0) for s in month_subs)
    monthly_attendance = await db.attendance.count_documents({'recorded_at': {'$gte': month_start.isoformat()}})
    unseen_alerts = await db.alerts.count_documents({'is_seen': False})
    inactive_users_marked = await db.users.count_documents({'marked_for_deletion': True})
    recent_attendance = await db.attendance.find({}, {'_id': 0}).sort('recorded_at', -1).to_list(5)
    recent_subscriptions = await db.subscriptions.find({}, {'_id': 0}).sort('purchased_at', -1).to_list(5)

    return {
        'total_users': total_users,
        'active_subscriptions': active_subs,
        'monthly_revenue': monthly_revenue,
        'monthly_attendance': monthly_attendance,
        'unseen_alerts': unseen_alerts,
        'inactive_users_marked': inactive_users_marked,
        'recent_attendance': recent_attendance,
        'recent_subscriptions': recent_subscriptions,
    }


@router.get('/reports/revenue')
async def get_revenue_report(months: int = 6, admin: dict = Depends(require_admin)):
    now = datetime.now(timezone.utc)
    results = []
    for i in range(months):
        month_date = now - timedelta(days=30 * i)
        month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if month_date.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1)

        subs = await db.subscriptions.find({'purchased_at': {'$gte': month_start.isoformat(), '$lt': month_end.isoformat()}}, {'_id': 0}).to_list(10000)
        revenue = sum(s.get('price', 0) for s in subs)
        results.append({'month': month_start.strftime('%B %Y'), 'month_num': month_start.month, 'year': month_start.year, 'revenue': revenue, 'subscriptions_count': len(subs)})
    return list(reversed(results))


@router.get('/reports/attendance')
async def get_attendance_report(months: int = 6, admin: dict = Depends(require_admin)):
    now = datetime.now(timezone.utc)
    results = []
    for i in range(months):
        month_date = now - timedelta(days=30 * i)
        month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if month_date.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1)

        count = await db.attendance.count_documents({'recorded_at': {'$gte': month_start.isoformat(), '$lt': month_end.isoformat()}})
        results.append({'month': month_start.strftime('%B %Y'), 'month_num': month_start.month, 'year': month_start.year, 'attendance': count})
    return list(reversed(results))


@router.get('/reports/locations')
async def get_locations_report(admin: dict = Depends(require_admin)):
    attendance = await db.attendance.find({}, {'_id': 0}).to_list(100000)
    location_counts = {}
    for att in attendance:
        loc = att.get('location', 'Necunoscut')
        location_counts[loc] = location_counts.get(loc, 0) + 1
    return [{'location': k, 'count': v} for k, v in sorted(location_counts.items(), key=lambda x: -x[1])]


@router.get('/reports/hours')
async def get_hours_report(admin: dict = Depends(require_admin)):
    attendance = await db.attendance.find({}, {'_id': 0}).to_list(100000)
    hour_counts = {i: 0 for i in range(24)}
    for att in attendance:
        try:
            dt = datetime.fromisoformat(att['recorded_at'])
            hour_counts[dt.hour] += 1
        except Exception:
            pass
    return [{'hour': k, 'count': v} for k, v in hour_counts.items()]


@router.get('/export/attendance')
async def export_attendance(date_from: Optional[str] = None, date_to: Optional[str] = None, admin: dict = Depends(require_admin)):
    query = {}
    if date_from:
        query['recorded_at'] = {'$gte': date_from}
    if date_to:
        if 'recorded_at' in query:
            query['recorded_at']['$lte'] = date_to
        else:
            query['recorded_at'] = {'$lte': date_to}

    records = await db.attendance.find(query, {'_id': 0}).sort('recorded_at', -1).to_list(100000)
    return records
