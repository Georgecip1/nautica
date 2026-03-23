import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')
JWT_SECRET = os.environ.get('JWT_SECRET')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24


def get_frontend_url() -> str:
    return os.environ.get('FRONTEND_URL', 'http://localhost:3000').rstrip('/')
