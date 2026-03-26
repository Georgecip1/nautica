from datetime import datetime, timezone

from core.db import db
from models.attendance import Alert

async def generate_alerts():
    now = datetime.now(timezone.utc)
    users = await db.users.find({}, {'_id': 0}).to_list(10000)

    for user in users:
        persons = []
        
        # EXCLUDEM STAFF-UL: Adăugăm adultul în lista de verificare DOAR dacă este client (USER)
        if user.get('role', 'USER') == 'USER':
            persons.append({'id': user['id'], 'type': 'user', 'name': user['name']})
            
        # Păstrăm verificarea copiilor (chiar dacă părintele e staff, copilul are nevoie de abonament)
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

            if not active_sub:
                if not queued_sub:
                    existing_alert = await db.alerts.find_one(
                        {'person_id': person['id'], 'alert_type': 'no_plan', 'is_seen': False}
                    )
                    if not existing_alert:
                        alert = Alert(
                            user_id=user['id'],
                            person_id=person['id'],
                            person_type=person['type'],
                            person_name=person['name'],
                            alert_type='no_plan',
                            message=f"{person['name']} nu are un abonament activ",
                        )
                        await db.alerts.insert_one(alert.model_dump())
            else:
                if active_sub.get('expires_at'):
                    expires = datetime.fromisoformat(active_sub['expires_at'])
                    days_left = (expires - now).days

                    if days_left <= 0 and not queued_sub:
                        existing_alert = await db.alerts.find_one(
                            {
                                'person_id': person['id'],
                                'alert_type': 'expired',
                                'subscription_id': active_sub['id'],
                                'is_seen': False,
                            }
                        )
                        if not existing_alert:
                            alert = Alert(
                                user_id=user['id'],
                                person_id=person['id'],
                                person_type=person['type'],
                                person_name=person['name'],
                                alert_type='expired',
                                message=f"Abonamentul lui {person['name']} a expirat",
                                subscription_id=active_sub['id'],
                            )
                            await db.alerts.insert_one(alert.model_dump())
                    elif days_left <= 7 and days_left > 0 and not queued_sub:
                        existing_alert = await db.alerts.find_one(
                            {
                                'person_id': person['id'],
                                'alert_type': 'expiring_soon',
                                'subscription_id': active_sub['id'],
                                'is_seen': False,
                            }
                        )
                        if not existing_alert:
                            alert = Alert(
                                user_id=user['id'],
                                person_id=person['id'],
                                person_type=person['type'],
                                person_name=person['name'],
                                alert_type='expiring_soon',
                                message=f"Abonamentul lui {person['name']} expiră în {days_left} zile",
                                subscription_id=active_sub['id'],
                            )
                            await db.alerts.insert_one(alert.model_dump())

                if active_sub.get('sessions_total'):
                    remaining = active_sub['sessions_total'] - active_sub.get('sessions_used', 0)
                    if remaining <= 2 and remaining > 0 and not queued_sub:
                        existing_alert = await db.alerts.find_one(
                            {
                                'person_id': person['id'],
                                'alert_type': 'low_entries',
                                'subscription_id': active_sub['id'],
                                'is_seen': False,
                            }
                        )
                        if not existing_alert:
                            alert = Alert(
                                user_id=user['id'],
                                person_id=person['id'],
                                person_type=person['type'],
                                person_name=person['name'],
                                alert_type='low_entries',
                                message=f"{person['name']} mai are doar {remaining} {'ședință' if remaining == 1 else 'ședințe'}",
                                subscription_id=active_sub['id'],
                            )
                            await db.alerts.insert_one(alert.model_dump())