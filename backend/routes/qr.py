from fastapi import APIRouter, Depends

from core.auth import require_admin
from services.qr import regenerate_qr_token, resolve_person_by_qr_token

router = APIRouter(tags=['qr'])


@router.get('/qr/validate/{token}')
async def validate_qr(token: str):
    return await resolve_person_by_qr_token(token)


@router.post('/qr/regenerate/{person_id}')
async def regenerate_qr(person_id: str, person_type: str = 'user', admin: dict = Depends(require_admin)):
    new_token = await regenerate_qr_token(person_id, person_type)
    return {'token': new_token}
