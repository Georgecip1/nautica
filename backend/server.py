import logging

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from core.config import CORS_ORIGINS
from core.db import close_db_client
from routes import attendance, auth, blog, catalog, contact, qr, reports, seed, subscriptions, users

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

app = FastAPI(title='Swim Club Nautica API')

for route_module in [auth, users, subscriptions, attendance, catalog, blog, reports, contact, qr, seed]:
    app.include_router(route_module.router, prefix='/api')

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.on_event('shutdown')
async def shutdown_db_client():
    close_db_client()
