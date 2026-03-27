from datetime import datetime, timezone
from core.db import db

async def log_action(actor_name: str, actor_role: str, action_type: str, details: str):
    """
    Inregistreaza o actiune critica in baza de date pentru audit (invizibil pt clienti).
    """
    audit_entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor_name": actor_name,
        "actor_role": actor_role,
        "action_type": action_type,  # Ex: "DELETE_ATTENDANCE", "CREATE_USER"
        "details": details
    }
    
    try:
        await db.action_logs.insert_one(audit_entry)
    except Exception as e:
        print(f"[!] Eroare la salvarea audit log-ului: {e}")