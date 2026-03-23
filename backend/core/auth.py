import logging
import secrets
import smtplib
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from typing import Optional

import bcrypt
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from core.config import JWT_ALGORITHM, JWT_EXPIRATION_HOURS, JWT_SECRET, get_frontend_url
from core.db import db

security = HTTPBearer(auto_error=False)
logger = logging.getLogger(__name__)
_EFFECTIVE_JWT_SECRET = JWT_SECRET or secrets.token_hex(32)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_token(user_id: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
    }
    return jwt.encode(payload, _EFFECTIVE_JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, _EFFECTIVE_JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expirat')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Token invalid')


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail='Autentificare necesară')
    payload = decode_token(credentials.credentials)
    user = await db.users.find_one({'id': payload['user_id']}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=401, detail='Utilizator negăsit')
    return user


async def require_admin(user: dict = Depends(get_current_user)):
    if user['role'] not in ['OWNER', 'COACH']:
        raise HTTPException(status_code=403, detail='Acces interzis')
    return user


async def require_owner(user: dict = Depends(get_current_user)):
    if user['role'] != 'OWNER':
        raise HTTPException(status_code=403, detail='Acces interzis - doar proprietar')
    return user


def build_password_link(token: str) -> str:
    return f"{get_frontend_url()}/seteaza-parola?token={token}"


def smtp_enabled() -> bool:
    import os
    required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_FROM_EMAIL']
    return all(os.environ.get(key) for key in required)


async def send_transactional_email(to_email: str, subject: str, text_body: str, html_body: Optional[str] = None) -> bool:
    import os
    if not smtp_enabled() or not to_email:
        return False

    message = EmailMessage()
    from_name = os.environ.get('SMTP_FROM_NAME', 'Swim Club Nautica')
    from_email = os.environ.get('SMTP_FROM_EMAIL')
    message['Subject'] = subject
    message['From'] = f'{from_name} <{from_email}>' if from_name else from_email
    message['To'] = to_email
    message.set_content(text_body)
    if html_body:
        message.add_alternative(html_body, subtype='html')

    host = os.environ.get('SMTP_HOST')
    port = int(os.environ.get('SMTP_PORT', '587'))
    username = os.environ.get('SMTP_USER')
    password = os.environ.get('SMTP_PASSWORD')
    use_ssl = os.environ.get('SMTP_USE_SSL', 'false').lower() == 'true'
    use_tls = os.environ.get('SMTP_USE_TLS', 'true').lower() == 'true'

    try:
        if use_ssl:
            with smtplib.SMTP_SSL(host, port, timeout=20) as smtp:
                if username and password:
                    smtp.login(username, password)
                smtp.send_message(message)
        else:
            with smtplib.SMTP(host, port, timeout=20) as smtp:
                smtp.ehlo()
                if use_tls:
                    smtp.starttls()
                    smtp.ehlo()
                if username and password:
                    smtp.login(username, password)
                smtp.send_message(message)
        return True
    except Exception:
        logger.exception('Failed to send email to %s', to_email)
        return False


async def issue_password_setup_token(user_id: str, hours_valid: int = 48) -> tuple[str, str]:
    token = secrets.token_urlsafe(32)
    expires = (datetime.now(timezone.utc) + timedelta(hours=hours_valid)).isoformat()
    await db.users.update_one(
        {'id': user_id},
        {'$set': {'password_setup_token': token, 'password_setup_expires': expires}},
    )
    return token, expires
