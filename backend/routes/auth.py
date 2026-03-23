from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends

from core.auth import (
    build_password_link,
    create_token,
    get_current_user,
    hash_password,
    issue_password_setup_token,
    send_transactional_email,
    verify_password,
)
from core.db import db
from models.user import (
    LoginRequest,
    LoginResponse,
    PasswordResetRequest,
    PasswordSetupRequest,
    UserResponse,
    UserUpdate,
)

router = APIRouter(tags=['auth'])


@router.post('/auth/login', response_model=LoginResponse)
async def login(request: LoginRequest):
    user = await db.users.find_one({'email': request.email}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=401, detail='Email sau parolă incorectă')
    if not user.get('password_hash'):
        raise HTTPException(
            status_code=401,
            detail='Contul nu are parolă setată. Verificați emailul pentru linkul de setare.',
        )
    if not verify_password(request.password, user['password_hash']):
        raise HTTPException(status_code=401, detail='Email sau parolă incorectă')

    await db.users.update_one(
        {'id': user['id']}, {'$set': {'last_activity': datetime.now(timezone.utc).isoformat()}}
    )

    token = create_token(user['id'], user['role'])
    return LoginResponse(token=token, user=UserResponse(**user))


@router.post('/auth/setup-password')
async def setup_password(request: PasswordSetupRequest):
    user = await db.users.find_one({'password_setup_token': request.token}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=400, detail='Token invalid sau expirat')

    if user.get('password_setup_expires'):
        expires = datetime.fromisoformat(user['password_setup_expires'])
        if datetime.now(timezone.utc) > expires:
            raise HTTPException(status_code=400, detail='Token expirat')

    password_hash = hash_password(request.password)
    await db.users.update_one(
        {'id': user['id']},
        {
            '$set': {
                'password_hash': password_hash,
                'password_setup_token': None,
                'password_setup_expires': None,
            }
        },
    )
    return {'message': 'Parolă setată cu succes'}


@router.post('/auth/request-reset')
async def request_password_reset(request: PasswordResetRequest):
    user = await db.users.find_one({'email': request.email}, {'_id': 0})
    if not user:
        return {'message': 'Dacă emailul există, veți primi un link de resetare'}

    token, _ = await issue_password_setup_token(user['id'], hours_valid=24)
    reset_link = build_password_link(token)
    email_sent = await send_transactional_email(
        user['email'],
        'Resetează parola contului tău Nautica',
        f"Bună, {user['name']}!\n\nFolosește acest link pentru a-ți reseta parola: {reset_link}\n\nLinkul expiră în 24 de ore.",
        f'<p>Bună, <strong>{user["name"]}</strong>!</p><p>Folosește acest link pentru a-ți reseta parola:</p><p><a href="{reset_link}">{reset_link}</a></p><p>Linkul expiră în 24 de ore.</p>',
    )
    response = {'message': 'Dacă emailul există, veți primi un link de resetare', 'email_sent': email_sent}
    if not email_sent:
        response['debug_token'] = token
        response['reset_link'] = reset_link
    return response


@router.get('/auth/me', response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(**user)


@router.put('/auth/me', response_model=UserResponse)
async def update_me(update: UserUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one({'id': user['id']}, {'$set': update_data})
    updated = await db.users.find_one({'id': user['id']}, {'_id': 0})
    return UserResponse(**updated)


@router.put('/auth/change-password')
async def change_password(current_password: str, new_password: str, user: dict = Depends(get_current_user)):
    if not user.get('password_hash'):
        raise HTTPException(status_code=400, detail='Contul nu are parolă setată')
    if not verify_password(current_password, user['password_hash']):
        raise HTTPException(status_code=400, detail='Parola curentă incorectă')

    password_hash = hash_password(new_password)
    await db.users.update_one({'id': user['id']}, {'$set': {'password_hash': password_hash}})
    return {'message': 'Parolă schimbată cu succes'}
