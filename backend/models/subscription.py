import uuid
from datetime import datetime, timezone
from typing import Optional, List

from pydantic import BaseModel, ConfigDict, Field


class SubscriptionCreate(BaseModel):
    user_id: str
    person_id: str
    person_type: str
    plan_id: str

class SubscriptionBatchCreate(BaseModel):
    subscriptions: List[SubscriptionCreate]

class Subscription(BaseModel):
    model_config = ConfigDict(extra='ignore')

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    person_id: str
    person_type: str
    plan_id: str
    plan_name: str
    location: str = "Fiald"  # Default
    sessions_total: Optional[int] = None
    sessions_used: int = 0
    status: str = 'queued' # active, queued, expired, completed
    purchased_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    activated_at: Optional[str] = None
    expires_at: Optional[str] = None
    price: float = 0.0


class SubscriptionResponse(BaseModel):
    id: str
    user_id: str
    person_id: str
    person_type: str
    plan_id: str
    plan_name: str
    location: str
    sessions_total: Optional[int] = None
    sessions_used: int = 0
    sessions_remaining: Optional[int] = None
    status: str
    purchased_at: str
    activated_at: Optional[str] = None
    expires_at: Optional[str] = None
    price: float