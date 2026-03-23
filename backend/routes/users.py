from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from core.auth import build_password_link, get_current_user, issue_password_setup_token, require_admin, require_owner, send_transactional_email
from core.db import db
from models.user import Child, ChildCreate, User, UserCreate, UserResponse, UserUpdate
from services.maintenance import mark_inactive_users_for_deletion

router = APIRouter(tags=['users'])


@router.get('/users', response_model=List[UserResponse])
async def get_users(role: Optional[str] = None, search: Optional[str] = None, admin: dict = Depends(require_admin)):
    await mark_inactive_users_for_deletion()
    query = {}
    if role:
        query['role'] = role
    if search:
        query['$or'] = [{'name': {'$regex': search, '$options': 'i'}}, {'email': {'$regex': search, '$options': 'i'}}]
    users = await db.users.find(query, {'_id': 0}).to_list(1000)
    return [UserResponse(**u) for u in users]


@router.get('/users/active-subscriptions')
async def get_users_with_active_subscriptions(search: Optional[str] = None, admin: dict = Depends(require_admin)):
    active_subs = await db.subscriptions.find({'status': 'active'}, {'_id': 0}).to_list(10000)
    results = []
    seen = set()

    for sub in active_subs:
        key = f"{sub['person_id']}_{sub['person_type']}"
        if key in seen:
            continue
        seen.add(key)

        user = await db.users.find_one({'id': sub['user_id']}, {'_id': 0})
        if not user:
            continue

        if sub['person_type'] == 'user':
            person_name = user['name']
        else:
            person_name = next((c['name'] for c in user.get('children', []) if c['id'] == sub['person_id']), 'Necunoscut')

        if search and search.lower() not in person_name.lower():
            continue

        results.append({
            'user_id': sub['user_id'],
            'person_id': sub['person_id'],
            'person_type': sub['person_type'],
            'person_name': person_name,
            'subscription': sub,
        })

    return sorted(results, key=lambda x: x['person_name'])


@router.get('/users/{user_id}', response_model=UserResponse)
async def get_user(user_id: str, admin: dict = Depends(require_admin)):
    user = await db.users.find_one({'id': user_id}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=404, detail='Utilizator negăsit')
    return UserResponse(**user)


@router.post('/users', response_model=UserResponse)
async def create_user(user_data: UserCreate, admin: dict = Depends(require_admin)):
    if user_data.role in ['OWNER', 'COACH'] and admin['role'] != 'OWNER':
        raise HTTPException(status_code=403, detail='Doar proprietarul poate crea conturi staff')

    if user_data.email:
        existing = await db.users.find_one({'email': user_data.email})
        if existing:
            raise HTTPException(status_code=400, detail='Email deja utilizat')

    user = User(**user_data.model_dump())
    await db.users.insert_one(user.model_dump())

    setup_link = None
    email_sent = False
    if user.email:
        token, expires = await issue_password_setup_token(user.id, hours_valid=48)
        user.password_setup_token = token
        user.password_setup_expires = expires
        setup_link = build_password_link(token)
        email_sent = await send_transactional_email(
            user.email,
            'Setează parola pentru contul tău Nautica',
            f"Bună, {user.name}!\n\nFolosește acest link pentru a-ți seta parola: {setup_link}\n\nLinkul expiră în 48 de ore.",
            f'<p>Bună, <strong>{user.name}</strong>!</p><p>Folosește acest link pentru a-ți seta parola:</p><p><a href="{setup_link}">{setup_link}</a></p><p>Linkul expiră în 48 de ore.</p>',
        )

    response_payload = UserResponse(**user.model_dump()).model_dump()
    if setup_link and not email_sent:
        response_payload['setup_link'] = setup_link
        response_payload['setup_token'] = user.password_setup_token
    response_payload['email_sent'] = email_sent
    return response_payload


@router.put('/users/{user_id}', response_model=UserResponse)
async def update_user(user_id: str, update: UserUpdate, admin: dict = Depends(require_admin)):
    user = await db.users.find_one({'id': user_id}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=404, detail='Utilizator negăsit')

    if user['role'] in ['OWNER', 'COACH'] and admin['role'] != 'OWNER':
        raise HTTPException(status_code=403, detail='Doar proprietarul poate modifica conturi staff')

    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data.get('email'):
        existing = await db.users.find_one({'email': update_data['email'], 'id': {'$ne': user_id}})
        if existing:
            raise HTTPException(status_code=400, detail='Email deja utilizat')

    if update_data:
        await db.users.update_one({'id': user_id}, {'$set': update_data})

    updated = await db.users.find_one({'id': user_id}, {'_id': 0})
    return UserResponse(**updated)


@router.delete('/users/{user_id}')
async def delete_user(user_id: str, admin: dict = Depends(require_owner)):
    user = await db.users.find_one({'id': user_id}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=404, detail='Utilizator negăsit')

    await db.users.delete_one({'id': user_id})
    await db.subscriptions.delete_many({'user_id': user_id})
    await db.attendance.delete_many({'user_id': user_id})
    await db.alerts.delete_many({'user_id': user_id})
    return {'message': 'Utilizator șters'}


@router.post('/users/{user_id}/resend-setup')
async def resend_setup_link(user_id: str, admin: dict = Depends(require_admin)):
    user = await db.users.find_one({'id': user_id}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=404, detail='Utilizator negăsit')
    if not user.get('email'):
        raise HTTPException(status_code=400, detail='Utilizatorul nu are email')

    token, _ = await issue_password_setup_token(user_id, hours_valid=48)
    setup_link = build_password_link(token)
    email_sent = await send_transactional_email(
        user['email'],
        'Link nou pentru setarea parolei Nautica',
        f"Bună, {user['name']}!\n\nFolosește acest link pentru a-ți seta parola: {setup_link}\n\nLinkul expiră în 48 de ore.",
        f'<p>Bună, <strong>{user["name"]}</strong>!</p><p>Folosește acest link pentru a-ți seta parola:</p><p><a href="{setup_link}">{setup_link}</a></p><p>Linkul expiră în 48 de ore.</p>',
    )
    response = {'message': 'Link trimis', 'email_sent': email_sent}
    if not email_sent:
        response['debug_token'] = token
        response['setup_link'] = setup_link
    return response


@router.post('/users/{user_id}/children', response_model=UserResponse)
async def add_child(user_id: str, child_data: ChildCreate, admin: dict = Depends(require_admin)):
    user = await db.users.find_one({'id': user_id}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=404, detail='Utilizator negăsit')

    child = Child(**child_data.model_dump())
    children = user.get('children', [])
    children.append(child.model_dump())

    await db.users.update_one({'id': user_id}, {'$set': {'children': children}})
    updated = await db.users.find_one({'id': user_id}, {'_id': 0})
    return UserResponse(**updated)


@router.put('/users/{user_id}/children/{child_id}')
async def update_child(user_id: str, child_id: str, child_data: ChildCreate, user: dict = Depends(get_current_user)):
    if user['id'] != user_id and user['role'] not in ['OWNER', 'COACH']:
        raise HTTPException(status_code=403, detail='Acces interzis')

    db_user = await db.users.find_one({'id': user_id}, {'_id': 0})
    if not db_user:
        raise HTTPException(status_code=404, detail='Utilizator negăsit')

    children = db_user.get('children', [])
    for i, child in enumerate(children):
        if child['id'] == child_id:
            children[i]['name'] = child_data.name
            if child_data.birth_date:
                children[i]['birth_date'] = child_data.birth_date
            break
    else:
        raise HTTPException(status_code=404, detail='Copil negăsit')

    await db.users.update_one({'id': user_id}, {'$set': {'children': children}})
    return {'message': 'Copil actualizat'}


@router.delete('/users/{user_id}/children/{child_id}')
async def delete_child(user_id: str, child_id: str, admin: dict = Depends(require_admin)):
    user = await db.users.find_one({'id': user_id}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=404, detail='Utilizator negăsit')

    children = [c for c in user.get('children', []) if c['id'] != child_id]
    await db.users.update_one({'id': user_id}, {'$set': {'children': children}})
    await db.subscriptions.delete_many({'person_id': child_id})
    return {'message': 'Copil șters'}


@router.post('/maintenance/mark-inactive-users')
async def run_inactive_user_maintenance(admin: dict = Depends(require_owner)):
    return await mark_inactive_users_for_deletion()
