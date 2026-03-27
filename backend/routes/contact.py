from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from core.db import db
from core.auth import require_admin
from models.content import ContactMessage
from services.email import send_contact_notification, send_contact_autoresponder

router = APIRouter(tags=['contact'])

class ContactMessageCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    message: str

@router.post('/contact', response_model=ContactMessage)
async def create_message(msg_data: ContactMessageCreate):
    msg = ContactMessage(**msg_data.model_dump())
    await db.contact_messages.insert_one(msg.model_dump())
    await send_contact_notification(client_name=msg.name, client_email=msg.email, client_phone=msg.phone, message_body=msg.message)
    if msg.email:
        try:
            await send_contact_autoresponder(msg.email, msg.name)
        except Exception:
            pass # Ignoram eroarea de SMTP
    return msg

@router.get('/contact', response_model=List[ContactMessage])
async def get_messages(unseen_only: bool = False, admin: dict = Depends(require_admin)):
    query = {'is_read': False} if unseen_only else {}
    msgs = await db.contact_messages.find(query, {'_id': 0}).sort('created_at', -1).to_list(1000)
    return [ContactMessage(**m) for m in msgs]

@router.put('/contact/{msg_id}/read', response_model=ContactMessage)
async def mark_read(msg_id: str, admin: dict = Depends(require_admin)):
    await db.contact_messages.update_one({'id': msg_id}, {'$set': {'is_read': True}})
    msg = await db.contact_messages.find_one({'id': msg_id}, {'_id': 0})
    if not msg:
        raise HTTPException(status_code=404, detail='Mesaj negăsit')
    return ContactMessage(**msg)