from fastapi import APIRouter

from core.auth import hash_password
from core.db import db
from models.plan import Coach, Location, Plan
from models.user import User

router = APIRouter(tags=['seed'])


@router.post('/seed')
async def seed_data():
    await db.coaches.delete_many({})
    await db.locations.delete_many({})
    await db.plans.delete_many({})

    coaches = [
        Coach(name='Ovidiu Galeru', role_title='Profesor – antrenor • Coordonator', phone='0745312668', coaching_types=['Performanță'], education=['Doctorat în Științele Educației', 'Masterat în Psihologia Sportului de Performanţă', 'Antrenor al Lotului Olimpic de Nataţie al României (JO Londra 2012, Rio 2016)'], photo_url='https://images.unsplash.com/photo-1584380931214-dbb5b72e7fd0?w=400', order=1),
        Coach(name='Cornelia Galeru', role_title='Antrenor • Coordonator', phone='0740251626', coaching_types=['Inițiere', 'Adulți', 'PT'], education=['Kinetoterapeut', 'Masterat în Kinetoterapie', 'Fostă medaliată la Campionatele Naţionale de copii şi juniori'], photo_url='https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400', order=2),
        Coach(name='Mara Nicola Galeru', role_title='Antrenor', phone='0758071073', coaching_types=['Inițiere', 'Copii', 'Adulți', 'PT'], education=['Instructor de înot', 'Licențiată în Comunicare și relații publice'], photo_url='https://images.unsplash.com/photo-1609208426408-bcbe7658b238?w=400', order=3),
        Coach(name='Alexandru Petrișor Pojoreanu', role_title='Antrenor', phone='0742468649', coaching_types=['Inițiere', 'Copii', 'Adulți', 'Performanță', 'PT'], education=['Profesor de Educație Fizică și Sport', 'Instructor de înot', 'Masterand la Universitatea Vasile Alecsandri din Bacău', 'Fost înotător de performanță'], photo_url='https://images.unsplash.com/photo-1584380931214-dbb5b72e7fd0?w=400', order=4),
        Coach(name='Sabin Jitaru', role_title='Antrenor', phone='0766416273', coaching_types=['Inițiere', 'Copii', 'Adulți', 'Performanță', 'PT'], education=['Masterat în Educaţie Fizică şi Sport', 'Fost campion naţional de juniori şi multiplu medaliat', 'Component al Lotului Național de Juniori al României'], photo_url='https://images.unsplash.com/photo-1584380931214-dbb5b72e7fd0?w=400', order=5),
        Coach(name='Adrian Nicu Poeană', role_title='Antrenor', phone='0761681499', coaching_types=['Inițiere', 'Performanță'], education=['Masterand în Performanță Sportivă', 'Fost campion naţional de copii'], photo_url='https://images.unsplash.com/photo-1584380931214-dbb5b72e7fd0?w=400', order=6),
        Coach(name='Alexandru Popa', role_title='Antrenor', phone='0749038205', coaching_types=['Inițiere', 'Performanță'], education=['Masterand în Performanță Sportivă', 'Fost înotător de performanţă'], photo_url='https://images.unsplash.com/photo-1584380931214-dbb5b72e7fd0?w=400', order=7),
    ]
    for coach in coaches:
        await db.coaches.insert_one(coach.model_dump())

    locations = [
        Location(name='Bazin Fiald (Hotel Fiald)', address='Strada Tazlăului 7A, Bacău, 600372', latitude=46.58216328636135, longitude=26.90225368249042, facilities=['Vestiare', 'Dușuri', 'Recepție', 'Parcare în zonă', 'SPA'], levels=['Inițiere', 'Copii', 'Adulți', 'Perfecționare', 'Performanță'], note='Acces prin recepția hotelului.', is_highlighted=True),
        Location(name='Bazinul Olimpic Bacău', address='Aleea Ghioceilor 10-14, Bacău, 600156', latitude=46.55783882908194, longitude=26.918723801004784, facilities=['Vestiare', 'Dușuri', 'Tribună', 'Parcare'], levels=['Inițiere', 'Copii', 'Adulți', 'Perfecționare', 'Performanță'], note='Programul poate varia în funcție de disponibilitatea bazinului.'),
        Location(name='Bazinul EMD Academy', address='Bulevardul Unirii 43, Bacău, 600398', latitude=46.57456179692856, longitude=26.92605471702549, facilities=['Vestiare', 'Dușuri'], levels=['Inițiere', 'Copii', 'Adulți'], note='Contact locație: office@complexemd.ro'),
    ]
    for location in locations:
        await db.locations.insert_one(location.model_dump())

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

    existing_admin = await db.users.find_one({'email': 'admin@nautica.ro'})
    if not existing_admin:
        admin_user = User(name='Administrator', email='admin@nautica.ro', role='OWNER', password_hash=hash_password('admin123'))
        await db.users.insert_one(admin_user.model_dump())

    return {'message': 'Date inițializate cu succes'}
