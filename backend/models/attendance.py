import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

class AttendanceCreate(BaseModel):
    qr_token: Optional[str] = None
    person_id: Optional[str] = None
    location: str = "Fiald"

class Attendance(BaseModel):
    model_config = ConfigDict(extra='ignore')

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    person_id: str
    person_type: str
    person_name: str
    subscription_id: str
    plan_name: str
    location: str
    
    # Timpul ajustat prin snapping (ex: 10:48 -> 11:00) folosit in rapoarte
    recorded_at: str 
    
    # Timpul real al scanarii
    original_scan_time: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AttendanceResponse(BaseModel):
    id: str
    user_id: str
    person_id: str
    person_type: str
    person_name: str
    subscription_id: str
    plan_name: str
    location: str
    recorded_at: str
    original_scan_time: str
    
    # Flag pentru Frontend ca sa afiseze Confetti la 50, 100, etc.
    milestone_reached: Optional[int] = None