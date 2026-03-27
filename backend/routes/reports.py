import io
import pandas as pd
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from core.auth import require_admin
from core.db import db
from collections import defaultdict

router = APIRouter(tags=['reports'])

@router.get('/reports/dashboard')
async def get_dashboard_stats(admin: dict = Depends(require_admin)):
    now = datetime.now(timezone.utc)
    first_day_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_users = await db.users.count_documents({'role': 'USER', 'marked_for_deletion': False})
    active_adults = await db.subscriptions.distinct("user_id", {"person_type": "user", "status": {"$in": ["active", "queued"]}})
    active_children = await db.subscriptions.distinct("person_id", {"person_type": "child", "status": {"$in": ["active", "queued"]}})
    active_subs = await db.subscriptions.count_documents({'status': 'active'})

    pipeline_revenue = [{"$match": {"purchased_at": {"$gte": first_day_of_month.isoformat()}}}, {"$group": {"_id": None, "total": {"$sum": "$price"}}}]
    rev_result = await db.subscriptions.aggregate(pipeline_revenue).to_list(1)
    monthly_revenue = rev_result[0]['total'] if rev_result else 0

    monthly_attendance = await db.attendance.count_documents({'recorded_at': {'$gte': first_day_of_month.isoformat()}})
    unseen_alerts = await db.alerts.count_documents({'is_seen': False})

    pipeline_top_plans = [{"$match": {"purchased_at": {"$gte": first_day_of_month.isoformat()}}}, {"$group": {"_id": "$plan_name", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}, {"$limit": 5}]
    top_plans = await db.subscriptions.aggregate(pipeline_top_plans).to_list(None)
    recent_att = await db.attendance.find({}, {'_id': 0, 'person_name': 1, 'location': 1, 'recorded_at': 1}).sort('original_scan_time', -1).limit(5).to_list(5)

    return {
        'total_users': total_users, 'active_adults': len(active_adults), 'active_children': len(active_children),
        'active_subscriptions': active_subs, 'monthly_revenue': monthly_revenue, 'monthly_attendance': monthly_attendance,
        'unseen_alerts': unseen_alerts, 'top_plans': top_plans, 'recent_attendance': recent_att
    }

@router.get('/reports/export/excel')
async def export_excel_report(start_date: Optional[str] = None, end_date: Optional[str] = None, admin: dict = Depends(require_admin)):
    query_sub = {}
    query_att = {}
    if start_date or end_date:
        date_q = {}
        if start_date: date_q["$gte"] = start_date
        if end_date: date_q["$lte"] = end_date
        query_sub["purchased_at"] = date_q
        query_att["recorded_at"] = date_q

    subs = await db.subscriptions.find(query_sub, {'_id': 0}).to_list(None)
    att = await db.attendance.find(query_att, {'_id': 0}).to_list(None)

    sub_data = [{"Client": s.get("person_name", "N/A"), "Tip Client": "Adult" if s.get("person_type") == "user" else "Copil", "Abonament": s.get("plan_name", "N/A"), "Pret (LEI)": s.get("price", 0), "Status": s.get("status", "N/A").upper()} for s in subs]
    att_data = [{"Client": a.get("person_name", "N/A"), "Abonament": a.get("plan_name", "N/A"), "Data": a.get("recorded_at", "")[:16].replace("T", " "), "Locatie": a.get("location", "Fiald")} for a in att]

    df_subs = pd.DataFrame(sub_data) if sub_data else pd.DataFrame(columns=["Client", "Tip Client", "Abonament", "Pret (LEI)", "Status"])
    df_att = pd.DataFrame(att_data) if att_data else pd.DataFrame(columns=["Client", "Abonament", "Data", "Locatie"])

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df_subs.to_excel(writer, sheet_name='Abonamente', index=False)
        df_att.to_excel(writer, sheet_name='Prezente', index=False)
        
        # Auto adjust column width
        for sheet_name in writer.sheets:
            worksheet = writer.sheets[sheet_name]
            for col_cells in worksheet.columns:
                max_length = max((len(str(cell.value)) for cell in col_cells), default=10)
                worksheet.column_dimensions[col_cells[0].column_letter].width = max_length + 2

    output.seek(0)
    
    timestamp = datetime.now().strftime("%Y-%m-%d")
    return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": f"attachment; filename=Raport_Nautica_{timestamp}.xlsx"})

@router.get('/reports/revenue')
async def get_revenue_chart(months: int = 6, admin: dict = Depends(require_admin)):
    now = datetime.now(timezone.utc)
    start_date = (now - timedelta(days=30 * months)).isoformat()
    subs = await db.subscriptions.find({"purchased_at": {"$gte": start_date}}, {"_id": 0, "purchased_at": 1, "price": 1}).to_list(None)
    
    revenue_by_month = defaultdict(float)
    for s in subs:
        if s.get("purchased_at"):
            month_str = datetime.fromisoformat(s["purchased_at"].replace('Z', '+00:00')).strftime('%B %Y')
            revenue_by_month[month_str] += s.get("price", 0)
            
    result = [{"month": k, "revenue": v} for k, v in revenue_by_month.items()]
    return result[-months:]

@router.get('/reports/attendance')
async def get_attendance_chart(months: int = 6, admin: dict = Depends(require_admin)):
    now = datetime.now(timezone.utc)
    start_date = (now - timedelta(days=30 * months)).isoformat()
    att = await db.attendance.find({"recorded_at": {"$gte": start_date}}, {"_id": 0, "recorded_at": 1}).to_list(None)
    
    att_by_month = defaultdict(int)
    for a in att:
        if a.get("recorded_at"):
            month_str = datetime.fromisoformat(a["recorded_at"].replace('Z', '+00:00')).strftime('%B %Y')
            att_by_month[month_str] += 1
            
    result = [{"month": k, "attendance": v} for k, v in att_by_month.items()]
    return result[-months:]

@router.get('/reports/locations')
async def get_locations_chart(admin: dict = Depends(require_admin)):
    pipeline = [{"$group": {"_id": "$location", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}]
    locs = await db.attendance.aggregate(pipeline).to_list(None)
    return [{"location": l["_id"] or "Nespecificat", "count": l["count"]} for l in locs]

@router.get('/reports/hours')
async def get_hours_chart(admin: dict = Depends(require_admin)):
    att = await db.attendance.find({}, {"_id": 0, "recorded_at": 1}).to_list(None)
    hours_count = defaultdict(int)
    
    for a in att:
        if a.get("recorded_at"):
            dt = datetime.fromisoformat(a["recorded_at"].replace('Z', '+00:00'))
            hours_count[dt.hour] += 1
            
    result = [{"hour": h, "count": hours_count.get(h, 0)} for h in range(6, 23)] 
    return result