from datetime import datetime, timedelta, timezone

from core.db import db


def get_user_reference_activity(user: dict) -> datetime:
    reference = user.get('last_activity') or user.get('created_at')
    if not reference:
        return datetime.now(timezone.utc)
    try:
        return datetime.fromisoformat(reference)
    except Exception:
        return datetime.now(timezone.utc)


async def mark_inactive_users_for_deletion() -> dict:
    now = datetime.now(timezone.utc)
    threshold = now - timedelta(days=365)
    users = await db.users.find({'role': 'USER'}, {'_id': 0}).to_list(100000)

    marked = 0
    restored = 0
    already_marked = 0

    for user in users:
        active_or_queued = await db.subscriptions.find_one(
            {'user_id': user['id'], 'status': {'$in': ['active', 'queued']}},
            {'_id': 0},
        )

        should_mark = get_user_reference_activity(user) < threshold and not active_or_queued
        is_marked = bool(user.get('marked_for_deletion'))

        if should_mark and not is_marked:
            await db.users.update_one({'id': user['id']}, {'$set': {'marked_for_deletion': True}})
            marked += 1
        elif should_mark and is_marked:
            already_marked += 1
        elif is_marked and not should_mark:
            await db.users.update_one({'id': user['id']}, {'$set': {'marked_for_deletion': False}})
            restored += 1

    return {
        'marked_now': marked,
        'already_marked': already_marked,
        'restored_now': restored,
    }
