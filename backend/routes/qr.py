import secrets
from fastapi import APIRouter, HTTPException, Depends
from core.auth import require_admin, get_current_user
from core.db import db
from routes.subscriptions import check_and_activate_queued

router = APIRouter(tags=['qr'])

@router.get('/scan/{token}')
async def scan_qr_token(token: str, admin: dict = Depends(require_admin)):
    """
    Ruta apelata cand antrenorul indreapta camera catre un cod QR.
    Valideaza token-ul si returneaza datele abonamentului curent pt confirmare pe ecran.
    """
    person_id = None
    person_type = None
    person_name = None
    user_id = None

    # 1. Cautam daca apartine Titularului de Cont
    user = await db.users.find_one({'qr_token': token, 'marked_for_deletion': False})
    if user:
        person_id = user['id']
        person_type = 'user'
        person_name = user['name']
        user_id = user['id']
    else:
        # 2. Cautam daca apartine unui Copil din contul unei familii
        user = await db.users.find_one({'children.qr_token': token, 'marked_for_deletion': False})
        if user:
            for child in user['children']:
                if child['qr_token'] == token:
                    person_id = child['id']
                    person_type = 'child'
                    person_name = child['name']
                    user_id = user['id']
                    break

    if not person_id:
        raise HTTPException(status_code=404, detail="Cod QR invalid sau cont șters.")

    # Activam pachetele in asteptare in caz ca ultimul abonament tocmai a expirat ieri
    await check_and_activate_queued(person_id, person_type)

    # 3. Gasim abonamentul ACTIV
    active_sub = await db.subscriptions.find_one({
        'person_id': person_id,
        'person_type': person_type,
        'status': 'active'
    }, {'_id': 0})

    if not active_sub:
        raise HTTPException(status_code=400, detail=f"{person_name} nu are niciun abonament activ.")

    # 4. Calculam sedintele
    remaining = None
    if active_sub.get('sessions_total'):
        remaining = active_sub['sessions_total'] - active_sub.get('sessions_used', 0)

    # Returnam exact datele necesare pentru frontend-ul antrenorului
    return {
        "user_id": user_id,
        "person_id": person_id,
        "person_type": person_type,
        "person_name": person_name,
        "plan_name": active_sub["plan_name"],
        "sessions_remaining": remaining,
        "sessions_total": active_sub.get("sessions_total"),
        "expires_at": active_sub.get("expires_at"),
        "location": active_sub.get("location", "Fiald")
    }


@router.post('/regenerate/{person_id}')
async def regenerate_qr_token_endpoint(
    person_id: str, 
    person_type: str = 'user', 
    current_user: dict = Depends(get_current_user)
):
    """
    Genereaza un nou cod QR pentru un client sau copilul acestuia.
    Poate fi apelat de Staff sau de insusi titularul contului de familie.
    """
    new_token = secrets.token_urlsafe(32)

    if person_type == 'user':
        user = await db.users.find_one({'id': person_id, 'marked_for_deletion': False})
        if not user:
            raise HTTPException(404, "Utilizator negăsit.")
        
        # Validare permisiuni
        if current_user["role"] not in ["OWNER", "COACH"] and current_user["id"] != user["id"]:
            raise HTTPException(403, "Nu ai permisiunea de a regenera acest cod.")

        await db.users.update_one({'id': person_id}, {'$set': {'qr_token': new_token}})
    else:
        user = await db.users.find_one({'children.id': person_id, 'marked_for_deletion': False})
        if not user:
            raise HTTPException(404, "Copil negăsit.")
            
        # Validare permisiuni
        if current_user["role"] not in ["OWNER", "COACH"] and current_user["id"] != user["id"]:
            raise HTTPException(403, "Nu ai permisiunea de a regenera acest cod.")

        await db.users.update_one(
            {'id': user['id'], 'children.id': person_id},
            {'$set': {'children.$.qr_token': new_token}}
        )

    return {"qr_token": new_token}