import uuid
from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class PlanCreate(BaseModel):
    location: str
    activity: str
    category: str
    scope: str
    sessions: Optional[int] = None
    duration_days: int
    validity_days: int
    price: float
    note: Optional[str] = None
    badge: Optional[str] = None
    is_active: bool = True


class Plan(BaseModel):
    model_config = ConfigDict(extra='ignore')

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location: str
    activity: str
    category: str
    scope: str
    sessions: Optional[int] = None
    duration_days: int
    validity_days: int
    price: float
    note: Optional[str] = None
    badge: Optional[str] = None
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class LocationCreate(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    facilities: List[str] = []
    levels: List[str] = []
    note: Optional[str] = None
    is_highlighted: bool = False


class Location(BaseModel):
    model_config = ConfigDict(extra='ignore')

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    address: str
    latitude: float
    longitude: float
    facilities: List[str] = []
    levels: List[str] = []
    note: Optional[str] = None
    is_highlighted: bool = False


class CoachCreate(BaseModel):
    name: str
    role_title: str
    phone: str
    coaching_types: List[str] = []
    education: List[str] = []
    photo_url: Optional[str] = None
    order: int = 0


class Coach(BaseModel):
    model_config = ConfigDict(extra='ignore')

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role_title: str
    phone: str
    coaching_types: List[str] = []
    education: List[str] = []
    photo_url: Optional[str] = None
    order: int = 0