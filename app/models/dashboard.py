import uuid
from sqlmodel import SQLModel, Field
from datetime import datetime
from pydantic import BaseModel

from .enum import (
    ProjectPriority,
    ProjectCategory
)

class Project(SQLModel, table=True):
    id: int | None = Field()
    u_id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    title: str | None = Field(default=str)
    summary: str | None = Field(default=str)
    
    priority: ProjectPriority = ProjectPriority.LOW
    category: ProjectCategory = ProjectCategory.SHORT_TERM

    start_date: datetime | None
    end_date: datetime | None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    @property
    def duration(self):
        return self.end_date - self.start_date