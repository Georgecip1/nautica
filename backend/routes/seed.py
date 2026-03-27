from fastapi import APIRouter

from core.db import db
from models.plan import Plan
from models.user import User

try:
    from core.auth import hash_password
except ImportError:
    from core.auth import get_password_hash as hash_password

router = APIRouter(tags=['seed'])

@router.post('/seed')
async def seed_data():
    await db.plans.delete_many({})
    await db.users.delete_many({})

    all_plans = [
        Plan(location='Bazin Fiald (Hotel Fiald)', activity='Ședință copii inițiere/perfecționare', category='KIDS', scope='child', sessions=1, duration_days=1, validity_days=30, price=80),
        Plan(location='Bazin Fiald (Hotel Fiald)', activity='Abonament copii 8 ședințe', category='KIDS', scope='child', sessions=8, duration_days=30, validity_days=30, price=440),
        Plan(location='Bazin Fiald (Hotel Fiald)', activity='Abonament copii 12 ședințe', category='KIDS', scope='child', sessions=12, duration_days=30, validity_days=30, price=550),
        Plan(location='Bazin Fiald (Hotel Fiald)', activity='Abonament adulți 8 ședințe', category='ADULTS', scope='adult', sessions=8, duration_days=30, validity_days=30, price=490),
        Plan(location='Bazin Fiald (Hotel Fiald)', activity='Abonament adulți 4 ședințe', category='ADULTS', scope='adult', sessions=4, duration_days=30, validity_days=30, price=290),
        Plan(location='Bazin Fiald (Hotel Fiald)', activity='Personal Training 1 ședință', category='ADULTS', scope='both', sessions=1, duration_days=1, validity_days=30, price=180, badge='PT'),
        Plan(location='Bazin Fiald (Hotel Fiald)', activity='Personal Training 4 ședințe', category='ADULTS', scope='both', sessions=4, duration_days=30, validity_days=30, price=620, badge='PT'),
        Plan(location='Bazin Fiald (Hotel Fiald)', activity='Abonament sport performanță', category='PERFORMANCE', scope='both', sessions=None, duration_days=30, validity_days=30, price=450, badge='Nelimitat'),
        Plan(location='Bazin Fiald (Hotel Fiald)', activity='Program grădiniță 4 ședințe', category='KIDS', scope='child', sessions=4, duration_days=30, validity_days=30, price=230),
        Plan(location='Bazin Fiald (Hotel Fiald)', activity='BabySwim 1 ședință', category='KIDS', scope='child', sessions=1, duration_days=1, validity_days=30, price=180, badge='BabySwim'),
        Plan(location='Bazin Fiald (Hotel Fiald)', activity='BabySwim 4 ședințe', category='KIDS', scope='child', sessions=4, duration_days=30, validity_days=30, price=620, badge='BabySwim'),
        Plan(location='Bazinul Olimpic Bacău', activity='Ședință copii', category='KIDS', scope='child', sessions=1, duration_days=1, validity_days=45, price=80),
        Plan(location='Bazinul Olimpic Bacău', activity='Abonament copii 10 ședințe', category='KIDS', scope='child', sessions=10, duration_days=45, validity_days=45, price=550),
        Plan(location='Bazinul Olimpic Bacău', activity='Abonament adulți 10 ședințe', category='ADULTS', scope='adult', sessions=10, duration_days=45, validity_days=45, price=550),
        Plan(location='Bazinul EMD Academy', activity='Ședință copii', category='KIDS', scope='child', sessions=1, duration_days=1, validity_days=45, price=80),
        Plan(location='Bazinul EMD Academy', activity='Abonament copii 8+1 ședințe', category='KIDS', scope='child', sessions=9, duration_days=45, validity_days=45, price=500),
    ]
    for plan in all_plans:
        await db.plans.insert_one(plan.model_dump())

    test_users = [
        User(
            name='Administrator', 
            email='admin@nautica.ro', 
            role='OWNER', 
            password_hash=hash_password('admin123')
        ),
        User(
            name='Ovidiu Antrenor', 
            email='antrenor@nautica.ro', 
            role='COACH', 
            password_hash=hash_password('antrenor123')
        ),
        User(
            name='Client Test', 
            email='client@nautica.ro', 
            role='USER', 
            password_hash=hash_password('client123')
        )
    ]
    for user in test_users:
        await db.users.insert_one(user.model_dump())

    return {'message': 'Baza de date inițializată: Planurile și cei 3 Useri de test au fost creați cu succes!'}