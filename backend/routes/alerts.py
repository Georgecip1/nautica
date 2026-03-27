from fastapi import APIRouter, Depends, HTTPException
from core.db import db
from core.auth import require_admin

router = APIRouter(tags=['alerts'])

@router.get('/alerts')
async def get_alerts(unseen_only: bool = False, admin: dict = Depends(require_admin)):
    query = {'is_seen': False} if unseen_only else {}
    alerts = await db.alerts.find(query, {'_id': 0}).sort('created_at', -1).to_list(1000)
    return alerts

@router.get('/alerts/count')
async def get_unseen_count(admin: dict = Depends(require_admin)):
    count = await db.alerts.count_documents({'is_seen': False})
    return {"count": count}

@router.put('/alerts/{alert_id}/seen')
async def mark_alert_seen(alert_id: str, admin: dict = Depends(require_admin)):
    result = await db.alerts.update_one({'id': alert_id}, {'$set': {'is_seen': True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alertă negăsită")
    return {"message": "Alertă marcată ca citită"}

@router.put('/alerts/seen-all')
async def mark_all_seen(admin: dict = Depends(require_admin)):
    await db.alerts.update_many({'is_seen': False}, {'$set': {'is_seen': True}})
    return {"message": "Toate alertele au fost marcate ca citite"}