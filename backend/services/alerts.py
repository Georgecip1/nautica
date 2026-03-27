import uuid
from datetime import datetime, timezone
from core.db import db

async def generate_alerts():
    """
    Cron Job care ruleaza periodic pentru a verifica statusul abonamentelor
    si a emite alerte doar pentru 'expirat', 'expira_curand' si 'sedinte_putine'.
    FARA alerte pentru no_plan.
    """
    now = datetime.now(timezone.utc)
    
    # Luam doar clientii care nu sunt stersi
    users = await db.users.find({"role": "USER", "marked_for_deletion": False}).to_list(None)

    for user in users:
        # Pregatim lista cu toti membrii familiei (titular + copii)
        persons = [{'id': user['id'], 'type': 'user', 'name': user['name']}]
        for child in user.get('children', []):
            persons.append({'id': child['id'], 'type': 'child', 'name': child['name']})

        for person in persons:
            active_sub = await db.subscriptions.find_one(
                {'person_id': person['id'], 'person_type': person['type'], 'status': 'active'},
                {'_id': 0},
            )
            queued_sub = await db.subscriptions.find_one(
                {'person_id': person['id'], 'person_type': person['type'], 'status': 'queued'},
                {'_id': 0},
            )

            # Daca nu are abonament activ, trecem mai departe (NU generam alerte no_plan)
            if not active_sub:
                continue

            # Verificam data de expirare (Expired & Expiring Soon)
            if active_sub.get('expires_at'):
                try:
                    expires = datetime.fromisoformat(active_sub['expires_at'].replace('Z', '+00:00'))
                    days_left = (expires - now).days

                    # 1. EXPIRAT
                    if days_left <= 0 and not queued_sub:
                        existing = await db.alerts.find_one({'person_id': person['id'], 'alert_type': 'expired', 'subscription_id': active_sub['id'], 'is_seen': False})
                        if not existing:
                            alert = {
                                "id": str(uuid.uuid4()), "user_id": user['id'], "person_id": person['id'], "person_type": person['type'],
                                "person_name": person['name'], "alert_type": "expired", "message": f"Abonamentul lui {person['name']} a expirat.",
                                "subscription_id": active_sub['id'], "is_seen": False, "created_at": now.isoformat()
                            }
                            await db.alerts.insert_one(alert)
                            
                    # 2. EXPIRĂ CURÂND (<= 7 zile)
                    elif 0 < days_left <= 7 and not queued_sub:
                        existing = await db.alerts.find_one({'person_id': person['id'], 'alert_type': 'expiring_soon', 'subscription_id': active_sub['id'], 'is_seen': False})
                        if not existing:
                            alert = {
                                "id": str(uuid.uuid4()), "user_id": user['id'], "person_id": person['id'], "person_type": person['type'],
                                "person_name": person['name'], "alert_type": "expiring_soon", "message": f"Abonamentul lui {person['name']} expiră în {days_left} zile.",
                                "subscription_id": active_sub['id'], "is_seen": False, "created_at": now.isoformat()
                            }
                            await db.alerts.insert_one(alert)
                except ValueError:
                    pass

            # 3. ȘEDINȚE PUȚINE (Low Entries <= 2)
            if active_sub.get('sessions_total'):
                remaining = active_sub['sessions_total'] - active_sub.get('sessions_used', 0)
                if 0 < remaining <= 2 and not queued_sub:
                    existing = await db.alerts.find_one({'person_id': person['id'], 'alert_type': 'low_entries', 'subscription_id': active_sub['id'], 'is_seen': False})
                    if not existing:
                        alert = {
                            "id": str(uuid.uuid4()), "user_id": user['id'], "person_id": person['id'], "person_type": person['type'],
                            "person_name": person['name'], "alert_type": "low_entries", "message": f"{person['name']} mai are doar {remaining} ședințe.",
                            "subscription_id": active_sub['id'], "is_seen": False, "created_at": now.isoformat()
                        }
                        await db.alerts.insert_one(alert)