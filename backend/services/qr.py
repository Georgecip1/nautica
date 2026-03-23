import secrets
from fastapi import HTTPException

from core.db import db


async def resolve_person_by_qr_token(qr_token: str):
    user = await db.users.find_one({'qr_token': qr_token}, {'_id': 0})
    if user:
        return {
            'valid': True,
            'person_id': user['id'],
            'person_type': 'user',
            'person_name': user['name'],
            'user_id': user['id'],
        }

    user = await db.users.find_one({'children.qr_token': qr_token}, {'_id': 0})
    if user:
        for child in user.get('children', []):
            if child.get('qr_token') == qr_token:
                return {
                    'valid': True,
                    'person_id': child['id'],
                    'person_type': 'child',
                    'person_name': child['name'],
                    'user_id': user['id'],
                }

    return {'valid': False}


async def regenerate_qr_token(person_id: str, person_type: str = 'user') -> str:
    new_token = secrets.token_urlsafe(32)

    if person_type == 'user':
        result = await db.users.update_one({'id': person_id}, {'$set': {'qr_token': new_token}})
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail='Utilizator negăsit')
    else:
        result = await db.users.update_one(
            {'children.id': person_id}, {'$set': {'children.$.qr_token': new_token}}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail='Copil negăsit')

    return new_token
