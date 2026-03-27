from datetime import datetime, timedelta, timezone
from core.db import db
from services.audit import log_action

async def cleanup_inactive_users():
    """
    Sterge utilizatorii (rol USER) inactivi de > 6 luni (180 zile).
    GDPR Compliant: Se sterg datele personale (Nume, Telefon, Cont), 
    dar istoricul financiar din 'subscriptions' si 'attendance' ramane pentru contabilitate.
    """
    now = datetime.now(timezone.utc)
    cutoff_date = now - timedelta(days=180)
    
    users = await db.users.find({"role": "USER"}).to_list(None)
    deleted_count = 0

    for user in users:
        user_id = user["id"]
        
        # 1. Are abonamente active sau in asteptare?
        has_active = await db.subscriptions.find_one({
            "user_id": user_id,
            "status": {"$in": ["active", "queued"]}
        })
        if has_active:
            continue
            
        # 2. Cand a expirat ultimul abonament al acestei familii?
        last_sub = await db.subscriptions.find_one(
            {"user_id": user_id},
            sort=[("expires_at", -1)]
        )
        
        should_delete = False
        
        if last_sub and last_sub.get("expires_at"):
            try:
                expires_at = datetime.fromisoformat(last_sub["expires_at"].replace('Z', '+00:00'))
                if expires_at < cutoff_date:
                    should_delete = True
            except ValueError:
                pass
        elif not last_sub:
            # Daca n-a avut niciodata abonament, ne uitam la data crearii contului
            try:
                created_at = datetime.fromisoformat(user.get("created_at", "").replace('Z', '+00:00'))
                if created_at < cutoff_date:
                    should_delete = True
            except ValueError:
                pass

        if should_delete:
            # Stergem user-ul si alertele asociate lui
            await db.users.delete_one({"id": user_id})
            await db.alerts.delete_many({"user_id": user_id})
            deleted_count += 1
            
            await log_action(
                actor_name="SYSTEM_MAINTENANCE",
                actor_role="SYSTEM",
                action_type="AUTO_DELETE_USER",
                details=f"Contul '{user['name']}' ({user.get('email', 'N/A')}) a fost sters automat din cauza inactivitatii (> 6 luni)."
            )

    print(f"[*] Maintenance: Au fost stersi automat {deleted_count} utilizatori inactivi.")
    return deleted_count