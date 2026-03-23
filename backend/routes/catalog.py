from typing import List

from fastapi import APIRouter, Depends, HTTPException

from core.auth import require_owner
from core.db import db
from models.plan import Coach, CoachCreate, Location, LocationCreate

router = APIRouter(tags=['catalog'])


@router.get('/locations', response_model=List[Location])
async def get_locations():
    locations = await db.locations.find({}, {'_id': 0}).to_list(100)
    return [Location(**l) for l in locations]


@router.get('/locations/{location_id}', response_model=Location)
async def get_location(location_id: str):
    location = await db.locations.find_one({'id': location_id}, {'_id': 0})
    if not location:
        raise HTTPException(status_code=404, detail='Locație negăsită')
    return Location(**location)


@router.post('/locations', response_model=Location)
async def create_location(location_data: LocationCreate, admin: dict = Depends(require_owner)):
    location = Location(**location_data.model_dump())
    await db.locations.insert_one(location.model_dump())
    return location


@router.put('/locations/{location_id}', response_model=Location)
async def update_location(location_id: str, location_data: LocationCreate, admin: dict = Depends(require_owner)):
    await db.locations.update_one({'id': location_id}, {'$set': location_data.model_dump()})
    location = await db.locations.find_one({'id': location_id}, {'_id': 0})
    return Location(**location)


@router.delete('/locations/{location_id}')
async def delete_location(location_id: str, admin: dict = Depends(require_owner)):
    await db.locations.delete_one({'id': location_id})
    return {'message': 'Locație ștearsă'}


@router.get('/coaches', response_model=List[Coach])
async def get_coaches():
    coaches = await db.coaches.find({}, {'_id': 0}).sort('order', 1).to_list(100)
    return [Coach(**c) for c in coaches]


@router.post('/coaches', response_model=Coach)
async def create_coach(coach_data: CoachCreate, admin: dict = Depends(require_owner)):
    coach = Coach(**coach_data.model_dump())
    await db.coaches.insert_one(coach.model_dump())
    return coach


@router.put('/coaches/{coach_id}', response_model=Coach)
async def update_coach(coach_id: str, coach_data: CoachCreate, admin: dict = Depends(require_owner)):
    await db.coaches.update_one({'id': coach_id}, {'$set': coach_data.model_dump()})
    coach = await db.coaches.find_one({'id': coach_id}, {'_id': 0})
    return Coach(**coach)


@router.delete('/coaches/{coach_id}')
async def delete_coach(coach_id: str, admin: dict = Depends(require_owner)):
    await db.coaches.delete_one({'id': coach_id})
    return {'message': 'Antrenor șters'}
