from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from core.auth import require_admin, require_owner
from core.db import db
from models.subscription import Subscription, SubscriptionCreate, SubscriptionResponse
from models.plan import Plan, PlanCreate

router = APIRouter(tags=['subscriptions'])


@router.get('/plans', response_model=List[Plan])
async def get_plans(location: Optional[str] = None, category: Optional[str] = None):
    query = {'is_active': True}
    if location:
        query['location'] = location
    if category:
        query['category'] = category
    plans = await db.plans.find(query, {'_id': 0}).to_list(100)
    return [Plan(**p) for p in plans]


@router.get('/plans/{plan_id}', response_model=Plan)
async def get_plan(plan_id: str):
    plan = await db.plans.find_one({'id': plan_id}, {'_id': 0})
    if not plan:
        raise HTTPException(status_code=404, detail='Abonament negăsit')
    return Plan(**plan)


@router.post('/plans', response_model=Plan)
async def create_plan(plan_data: PlanCreate, admin: dict = Depends(require_owner)):
    plan = Plan(**plan_data.model_dump())
    await db.plans.insert_one(plan.model_dump())
    return plan


@router.put('/plans/{plan_id}', response_model=Plan)
async def update_plan(plan_id: str, plan_data: PlanCreate, admin: dict = Depends(require_owner)):
    await db.plans.update_one({'id': plan_id}, {'$set': plan_data.model_dump()})
    plan = await db.plans.find_one({'id': plan_id}, {'_id': 0})
    return Plan(**plan)


@router.delete('/plans/{plan_id}')
async def delete_plan(plan_id: str, admin: dict = Depends(require_owner)):
    await db.plans.delete_one({'id': plan_id})
    return {'message': 'Abonament șters'}


async def get_person_info(user_id: str, person_id: str, person_type: str):
    user = await db.users.find_one({'id': user_id}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=404, detail='Utilizator negăsit')

    if person_type == 'user':
        return user_id, user['name']
    for child in user.get('children', []):
        if child['id'] == person_id:
            return user_id, child['name']
    raise HTTPException(status_code=404, detail='Copil negăsit')


async def activate_subscription(sub_id: str):
    sub = await db.subscriptions.find_one({'id': sub_id}, {'_id': 0})
    if not sub or sub['status'] != 'queued':
        return

    plan = await db.plans.find_one({'id': sub['plan_id']}, {'_id': 0})
    if not plan:
        return

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=plan['validity_days'])
    await db.subscriptions.update_one(
        {'id': sub_id},
        {'$set': {'status': 'active', 'activated_at': now.isoformat(), 'expires_at': expires_at.isoformat()}},
    )


async def check_and_activate_queued(person_id: str, person_type: str):
    active = await db.subscriptions.find_one(
        {'person_id': person_id, 'person_type': person_type, 'status': 'active'}, {'_id': 0}
    )

    if active:
        now = datetime.now(timezone.utc)
        if active.get('expires_at'):
            expires = datetime.fromisoformat(active['expires_at'])
            if now > expires:
                await db.subscriptions.update_one({'id': active['id']}, {'$set': {'status': 'expired'}})
                active = None

        if active and active.get('sessions_total'):
            if active['sessions_used'] >= active['sessions_total']:
                await db.subscriptions.update_one({'id': active['id']}, {'$set': {'status': 'completed'}})
                active = None

    if not active:
        queued = await db.subscriptions.find_one(
            {'person_id': person_id, 'person_type': person_type, 'status': 'queued'},
            {'_id': 0},
            sort=[('purchased_at', 1)],
        )
        if queued:
            await activate_subscription(queued['id'])


@router.get('/subscriptions', response_model=List[SubscriptionResponse])
async def get_subscriptions(user_id: Optional[str] = None, person_id: Optional[str] = None, status: Optional[str] = None, admin: dict = Depends(require_admin)):
    query = {}
    if user_id:
        query['user_id'] = user_id
    if person_id:
        query['person_id'] = person_id
    if status:
        query['status'] = status

    subs = await db.subscriptions.find(query, {'_id': 0}).sort('purchased_at', -1).to_list(1000)
    result = []
    for s in subs:
        remaining = None
        if s.get('sessions_total'):
            remaining = s['sessions_total'] - s.get('sessions_used', 0)
        result.append(SubscriptionResponse(**s, sessions_remaining=remaining))
    return result


@router.get('/subscriptions/person/{person_id}')
async def get_person_subscriptions(person_id: str, person_type: str = 'user'):
    await check_and_activate_queued(person_id, person_type)
    subs = await db.subscriptions.find({'person_id': person_id, 'person_type': person_type}, {'_id': 0}).sort('purchased_at', -1).to_list(100)

    result = []
    for s in subs:
        remaining = None
        if s.get('sessions_total'):
            remaining = s['sessions_total'] - s.get('sessions_used', 0)
        result.append(SubscriptionResponse(**s, sessions_remaining=remaining))
    return result


@router.post('/subscriptions', response_model=SubscriptionResponse)
async def create_subscription(sub_data: SubscriptionCreate, admin: dict = Depends(require_admin)):
    plan = await db.plans.find_one({'id': sub_data.plan_id}, {'_id': 0})
    if not plan:
        raise HTTPException(status_code=404, detail='Abonament negăsit')

    user_id, person_name = await get_person_info(sub_data.user_id, sub_data.person_id, sub_data.person_type)
    existing_active = await db.subscriptions.find_one({'person_id': sub_data.person_id, 'person_type': sub_data.person_type, 'status': 'active'})

    status = 'queued' if existing_active else 'active'
    now = datetime.now(timezone.utc)

    sub = Subscription(
        user_id=sub_data.user_id,
        person_id=sub_data.person_id,
        person_type=sub_data.person_type,
        plan_id=plan['id'],
        plan_name=plan['activity'],
        location=plan['location'],
        sessions_total=plan['sessions'],
        status=status,
        price=plan['price'],
    )

    if status == 'active':
        sub.activated_at = now.isoformat()
        sub.expires_at = (now + timedelta(days=plan['validity_days'])).isoformat()

    await db.subscriptions.insert_one(sub.model_dump())
    await db.users.update_one({'id': sub_data.user_id}, {'$set': {'last_activity': now.isoformat(), 'marked_for_deletion': False}})

    remaining = None
    if sub.sessions_total:
        remaining = sub.sessions_total - sub.sessions_used
    return SubscriptionResponse(**sub.model_dump(), sessions_remaining=remaining)


@router.delete('/subscriptions/{sub_id}')
async def delete_subscription(sub_id: str, admin: dict = Depends(require_admin)):
    sub = await db.subscriptions.find_one({'id': sub_id}, {'_id': 0})
    if not sub:
        raise HTTPException(status_code=404, detail='Abonament negăsit')

    await db.subscriptions.delete_one({'id': sub_id})
    await check_and_activate_queued(sub['person_id'], sub['person_type'])
    return {'message': 'Abonament șters'}
