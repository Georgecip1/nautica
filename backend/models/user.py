import secrets
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRole(str):
    OWNER = 'OWNER'
    COACH = 'COACH'
    USER = 'USER'


class ChildCreate(BaseModel):
    name: str
    birth_date: Optional[str] = None


class Child(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    birth_date: Optional[str] = None
    qr_token: str = Field(default_factory=lambda: secrets.token_urlsafe(32))


class UserCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: str = 'USER'


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class User(BaseModel):
    model_config = ConfigDict(extra='ignore')

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str = 'USER'
    password_hash: Optional[str] = None
    password_setup_token: Optional[str] = None
    password_setup_expires: Optional[str] = None
    qr_token: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    children: List[Child] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    last_activity: Optional[str] = None
    marked_for_deletion: bool = False


class UserResponse(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    qr_token: Optional[str] = None
    children: List[Child] = []
    created_at: str
    last_activity: Optional[str] = None
    marked_for_deletion: bool = False


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    user: UserResponse


class PasswordSetupRequest(BaseModel):
    token: str
    password: str


class PasswordResetRequest(BaseModel):
    email: str
