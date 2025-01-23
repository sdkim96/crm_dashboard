import uuid
from datetime import timedelta
from typing import List
from sqlmodel import (
    SQLModel, 
    Field, 
    Session, 
    update, 
    insert,
    select
)
from pydantic import BaseModel
from datetime import datetime

from .enum import (
    ProjectPriority,
    ProjectCategory,
    ProjectDateFilter,
    ProjectPriorityDTO,
    ProjectCategoryDTO,
)

class ProjectDTO(BaseModel):
    u_id: uuid.UUID = Field(default_factory=uuid.uuid4)

    title: str
    summary: str

    priority: ProjectPriority
    category: ProjectCategory
    start_date: int
    end_date: int
    


class Project(SQLModel, table=True):
    u_id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    title: str | None = Field(default="")
    summary: str | None = Field(default="")

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
    def filter(
        cls,
        db: Session,
        category: ProjectCategory | None,
        priority: ProjectPriority | None,
        query: str | None,
        date_filter: ProjectDateFilter | None,
        offset: int,
        limit: int
    ) -> List["Project"]:
    
        stmt = select(cls)
        
        if category:
            stmt = stmt.where(cls.category == category)
        if priority:
            stmt = stmt.where(cls.priority == priority)
        if query:
            stmt = stmt.where(cls.title.like(f"%{query}%") | cls.summary.like(f"%{query}%")) # type: ignore
        if date_filter:
            if date_filter == ProjectDateFilter.WEEK:
                start_of_week = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
                start_of_week = start_of_week - timedelta(days=start_of_week.weekday())
                end_of_week = start_of_week + timedelta(days=6, hours=23, minutes=59, seconds=59)
                stmt = stmt.where(cls.end_date.between(int(start_of_week.timestamp()), int(end_of_week.timestamp()))) # type: ignore
            elif date_filter == ProjectDateFilter.MONTH:
                start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                next_month = start_of_month.replace(day=28) + timedelta(days=4)
                start_of_next_month = next_month.replace(day=1)
                end_of_month = start_of_next_month - timedelta(seconds=1)
                stmt = stmt.where(cls.end_date.between(int(start_of_month.timestamp()), int(end_of_month.timestamp()))) # type: ignore
        
        stmt = stmt.offset(offset).limit(limit).order_by(cls.created_at.desc()) # type: ignore
        
        return db.exec(stmt).all() # type: ignore

    @classmethod
    def put(
        cls,        
        db: Session,         
        title: str,
        summary: str,
        priority: ProjectPriority,
        category: ProjectCategory,
        start_date: int,
        end_date: int,
        u_id: uuid.UUID | None = None,

    ):
        """ data 는 무조건 아래와 같은 필드를 가져야함 """

        if u_id is None:
            # insert
            stmt = (
                insert(cls)
                .values(
                    title=title,
                    summary=summary,
                    priority=priority,
                    category=category,
                    start_date=start_date,
                    end_date=end_date
                )
            )
            
        else:
            # update
            stmt = (
                update(cls)
                .where(cls.u_id == u_id) # type: ignore
                .values(
                    title=title,
                    summary=summary,
                    priority=priority,
                    category=category,
                    start_date=start_date,
                    end_date=end_date,
                    updated_at=int(datetime.now().timestamp())
                )
            )

        try:
            db.exec(stmt) # type: ignore
            db.commit()
        except Exception as e:
            raise e