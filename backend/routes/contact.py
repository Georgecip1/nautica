import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from core.auth import require_admin
from core.db import db
from models.content import ContactMessage

router = APIRouter(tags=['contact'])


@router.post('/contact')
async def submit_contact(message: ContactMessage):
    contact_doc = {
        'id': str(uuid.uuid4()),
        **message.model_dump(),
        'created_at': datetime.now(timezone.utc).isoformat(),
        'is_read': False,
    }
    await db.contact_messages.insert_one(contact_doc)
    return {'message': 'Mesaj trimis cu succes'}


@router.get('/contact/messages')
async def get_contact_messages(admin: dict = Depends(require_admin)):
    messages = await db.contact_messages.find({}, {'_id': 0}).sort('created_at', -1).to_list(100)
    return messages


@router.put('/contact/messages/{message_id}/read')
async def mark_contact_message_read(message_id: str, admin: dict = Depends(require_admin)):
    result = await db.contact_messages.update_one({'id': message_id}, {'$set': {'is_read': True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Mesaj negăsit')
    return {'message': 'Mesaj marcat ca citit'}
