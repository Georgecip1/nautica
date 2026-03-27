import uuid
from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class BlogPostCreate(BaseModel):
    title: str
    slug: str
    excerpt: str
    content: str
    images: List[str] = []
    is_published: bool = True


class BlogPost(BaseModel):
    model_config = ConfigDict(extra='ignore')

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    excerpt: str
    content: str
    images: List[str] = []
    is_published: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ContactMessage(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    message: str