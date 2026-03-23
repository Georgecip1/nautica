import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AttendanceCreate(BaseModel):
    person_id: str
    person_type: str
    location: str
    method: str = 'manual'


class Attendance(BaseModel):
    model_config = ConfigDict(extra='ignore')

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    person_id: str
    person_type: str
    person_name: str
    location: str
    subscription_id: str
    method: str
    recorded_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    recorded_by: Optional[str] = None


class Alert(BaseModel):
    model_config = ConfigDict(extra='ignore')

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    person_id: str
    person_type: str
    person_name: str
    alert_type: str
    message: str
    subscription_id: Optional[str] = None
    is_seen: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
