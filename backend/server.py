import io
import logging
from datetime import datetime, timedelta, timezone

import pandas as pd
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from core.config import CORS_ORIGINS
from core.db import close_db_client
from services.email import send_automated_report
from services.maintenance import cleanup_inactive_users

# ==========================================
# IMPORT DIRECT AL RUTELOR (Bypasseaza __init__.py pentru a opri erorile 404)
# ==========================================
from routes.attendance import router as attendance_router
from routes.auth import router as auth_router
from routes.blog import router as blog_router
from routes.catalog import router as catalog_router
from routes.contact import router as contact_router
from routes.qr import router as qr_router
from routes.reports import router as reports_router
from routes.seed import router as seed_router
from routes.subscriptions import router as subscriptions_router
from routes.users import router as users_router
from routes.alerts import router as alerts_router

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title='Swim Club Nautica API')

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Adaugam toate routerele importate direct
routers = [
    attendance_router, auth_router, blog_router, catalog_router, 
    contact_router, qr_router, reports_router, seed_router, 
    subscriptions_router, users_router, alerts_router
]

for router in routers:
    app.include_router(router, prefix='/api')

# --- SCHEDULER ---
scheduler = AsyncIOScheduler()

async def generate_and_send_excel_report(start_date: str, end_date: str, period_name: str, is_yearly: bool):
    from core.db import db
    query_sub = {"purchased_at": {"$gte": start_date, "$lte": end_date}}
    subs = await db.subscriptions.find(query_sub, {'_id': 0}).to_list(None)
    
    sub_data = []
    for s in subs:
        sub_data.append({
            "Client": s.get("person_name", "N/A"),
            "Tip Client": "Adult" if s.get("person_type") == "user" else "Copil",
            "Abonament": s.get("plan_name", "N/A"),
            "Pret Achitat (LEI)": s.get("price", 0),
            "Data Achizitiei": s.get("purchased_at", "")[:10] if s.get("purchased_at") else "",
            "Status": s.get("status", "N/A").upper()
        })

    df_subs = pd.DataFrame(sub_data) if sub_data else pd.DataFrame(columns=["Client", "Tip Client", "Abonament", "Pret Achitat (LEI)", "Data Achizitiei", "Status"])
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df_subs.to_excel(writer, sheet_name='Abonamente Vandute', index=False)
        worksheet = writer.sheets['Abonamente Vandute']
        for col_cells in worksheet.columns:
            worksheet.column_dimensions[col_cells[0].column_letter].width = max((len(str(cell.value)) for cell in col_cells), default=10) + 2

    output.seek(0)
    await send_automated_report(period_name, output.getvalue(), is_yearly=is_yearly)

@app.on_event('startup')
async def startup_event():
    scheduler.add_job(cleanup_inactive_users, CronTrigger(hour=3, minute=0))
    async def monthly_task():
        now = datetime.now(timezone.utc)
        first_day_this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_day_prev_month = first_day_this_month - timedelta(days=1)
        await generate_and_send_excel_report(last_day_prev_month.replace(day=1).isoformat(), last_day_prev_month.isoformat(), f"{last_day_prev_month.replace(day=1).strftime('%B %Y')}", is_yearly=False)
    scheduler.add_job(monthly_task, CronTrigger(day=1, hour=2, minute=0))
    scheduler.start()

@app.on_event('shutdown')
async def shutdown_event():
    scheduler.shutdown()
    close_db_client()