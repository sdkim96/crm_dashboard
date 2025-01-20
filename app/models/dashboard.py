import uuid
from sqlmodel import SQLModel, Field, Session
from datetime import datetime
from pydantic import BaseModel

from .enum import (
    ProjectPriority,
    ProjectCategory
)

class Project(SQLModel, table=True):
    u_id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    title: str | None = Field(default=str)
    summary: str | None = Field(default=str)

    priority: ProjectPriority = ProjectPriority.LOW
    category: ProjectCategory = ProjectCategory.SHORT_TERM

    start_date: int
    end_date: int
    created_at: int = Field(default_factory=lambda: int(datetime.now().timestamp()))
    updated_at: int = Field(default_factory=lambda: int(datetime.now().timestamp()))

    @property
    def duration(self):
        if self.start_date and self.end_date:
            return self.end_date - self.start_date
        return None
    

    @classmethod
    def put(cls, db: Session, data):
        project = Project(
            title=data.title,
            summary=data.summary,
            priority=data.priority,
            category=data.category,
            start_date=data.start_date,
            end_date=data.end_date
        )
        db.add(project)
        db.commit()
        db.refresh(project)