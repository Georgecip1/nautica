import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from core.db import db
from core.auth import require_admin, get_current_user

# Fallback pentru functia de parola
try:
    from core.auth import hash_password
except ImportError:
    from core.auth import get_password_hash as hash_password

from models.user import User

router = APIRouter(tags=['users'])

# --- Modele Pydantic ---
class ChildCreate(BaseModel):
    name: str
    birth_date: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_shared_family: Optional[bool] = None
    secondary_parent_name: Optional[str] = None
    secondary_parent_phone: Optional[str] = None

class UserCreate(BaseModel):
    name: str
    email: Optional[str] = None
    role: str = "USER"
    is_shared_family: bool = False

# ====================================================
# RUTELE
# ====================================================

@router.get('/users')
async def get_users(
    page: int = 1, limit: int = 15, search: str = "", sort_by: str = "name_asc", role: str = None, filter_status: str = None,
    admin: dict = Depends(require_admin)
):
    query = {"marked_for_deletion": False}
    if role:
        query["role"] = role
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}}
        ]
    
    sort_config = [("name", 1)]
    if sort_by == "name_desc":
        sort_config = [("name", -1)]
    elif sort_by == "newest":
        sort_config = [("created_at", -1)]

    # Fetch initial brut (va fi filtrat in memorie daca se cere 'filter_status')
    cursor = db.users.find(query, {"_id": 0, "password_hash": 0}).sort(sort_config)
    users = await cursor.to_list(None)

    # AGREGAM STATUS COLOR (Verificam abonamentele familiei)
    for user in users:
        user["status_color"] = "none"
        if user["role"] == "USER":
            person_ids = [user["id"]] + [c["id"] for c in user.get("children", [])]
            
            alerts = await db.alerts.find({
                "person_id": {"$in": person_ids},
                "is_seen": False
            }).to_list(None)
            
            if alerts:
                if any(a["alert_type"] == "expired" for a in alerts):
                    user["status_color"] = "red"
                elif any(a["alert_type"] in ["expiring_soon", "low_entries"] for a in alerts):
                    user["status_color"] = "yellow"

    # Filtrare manuala in caz ca s-a selectat 'cu probleme' primul
    if filter_status == "problems":
        users = [u for u in users if u["status_color"] in ["red", "yellow"]] + [u for u in users if u["status_color"] == "none"]

    total = len(users)
    skip = (page - 1) * limit
    paginated_users = users[skip : skip + limit]

    return {"data": paginated_users, "total": total, "page": page, "total_pages": max(1, (total + limit - 1) // limit)}


@router.get('/users/active-subscriptions')
async def get_active_users(search: str = "", admin: dict = Depends(require_admin)):
    """Returneaza userii cu abonamente active pentru pagina de Prezenta Manuala."""
    subs = await db.subscriptions.find({"status": "active"}).to_list(None)
    active_list = []
    for s in subs:
        if search and search.lower() not in s["person_name"].lower():
            continue
        active_list.append({
            "person_id": s["person_id"],
            "person_type": s["person_type"],
            "person_name": s["person_name"],
            "subscription": s
        })
    return active_list


@router.get('/users/{user_id}')
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["OWNER", "COACH"] and current_user["id"] != user_id:
        raise HTTPException(403, "Access interzis")
    user = await db.users.find_one({"id": user_id, "marked_for_deletion": False}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(404, "Utilizator negăsit")
    return user


@router.post('/users')
async def create_user(user_data: UserCreate, admin: dict = Depends(require_admin)):
    if user_data.email:
        existing = await db.users.find_one({"email": user_data.email})
        if existing:
            raise HTTPException(400, "Email-ul există deja în sistem")
        
    new_user_dict = {
        "id": str(uuid.uuid4()),
        "name": user_data.name,
        "email": user_data.email,
        "role": user_data.role,
        "is_shared_family": user_data.is_shared_family,
        "password_hash": hash_password("SeteazaParola123!"),
        "qr_token": str(uuid.uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_activity": datetime.now(timezone.utc).isoformat(),
        "marked_for_deletion": False,
        "children": []
    }
    
    await db.users.insert_one(new_user_dict)
    
    # QoL: Email opțional de bun venit
    if user_data.email:
        try:
            from services.email import send_welcome_email
            await send_welcome_email(new_user_dict["email"], new_user_dict["name"], "SeteazaParola123!")
        except Exception:
            pass # Ignoram erorile SMTP daca serverul de mail pica
    
    return {"message": "Utilizator creat", "id": new_user_dict["id"]}


@router.put('/users/{user_id}')
async def update_user(user_id: str, data: UserUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["OWNER", "COACH"] and current_user["id"] != user_id:
        raise HTTPException(403, "Access interzis")
        
    update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
    await db.users.update_one({"id": user_id}, {"$set": update_dict})
    return {"message": "Actualizat cu succes"}


@router.delete('/users/{user_id}')
async def delete_user(user_id: str, admin: dict = Depends(require_admin)):
    await db.users.update_one({"id": user_id}, {"$set": {"marked_for_deletion": True}})
    return {"message": "Utilizator sters"}


@router.post('/users/{user_id}/resend-setup')
async def resend_setup(user_id: str, admin: dict = Depends(require_admin)):
    user = await db.users.find_one({"id": user_id})
    if not user or not user.get("email"):
        raise HTTPException(404, "Utilizator fără adresă de email")
    from services.email import send_welcome_email
    await send_welcome_email(user["email"], user["name"], "SeteazaParola123!")
    return {"message": "Email retrimis"}


# ====================================================
# RUTE COPII (Ierarhie de Familie - Faza 1)
# ====================================================
@router.post('/users/{user_id}/children')
async def add_child(user_id: str, data: ChildCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["OWNER", "COACH"] and current_user["id"] != user_id:
        raise HTTPException(403, "Access interzis")
        
    import secrets
    new_child = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "birth_date": data.birth_date,
        "qr_token": secrets.token_urlsafe(16)
    }
    await db.users.update_one({"id": user_id}, {"$push": {"children": new_child}})
    return new_child


@router.delete('/users/{user_id}/children/{child_id}')
async def delete_child(user_id: str, child_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["OWNER", "COACH"] and current_user["id"] != user_id:
        raise HTTPException(403, "Access interzis")
    await db.users.update_one({"id": user_id}, {"$pull": {"children": {"id": child_id}}})
    return {"message": "Copil sters"}