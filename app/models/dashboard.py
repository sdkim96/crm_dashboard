import uuid
from datetime import timedelta
from typing import List
from sqlmodel import (
    SQLModel, 
    Field, 
    Session, 
    update, 
    insert,
    select,
    delete
)
from pydantic import BaseModel
from datetime import datetime

from .enum import (
    ProjectPriority,
    ProjectCategory,
    ProjectDateFilter,
)



class ProjectDTO(BaseModel):
    u_id: uuid.UUID = Field(default_factory=uuid.uuid4)

    title: str | None = Field(default="")
    summary: str | None = Field(default="")
    content: str | None = Field(default=None)

    priority: ProjectPriority
    category: ProjectCategory

    start_date: int
    end_date: int

    file_id: uuid.UUID | None = Field(default=None)
    file_name: str | None = Field(default=None)
    original_file_name: str | None = Field(default=None)
    


class Project(SQLModel, table=True):
    u_id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    title: str | None = Field(default="")
    summary: str | None = Field(default="")
    content: str | None = Field(default=None)

    priority: ProjectPriority = ProjectPriority.LOW
    category: ProjectCategory = ProjectCategory.SHORT_TERM

    start_date: int
    end_date: int

    file_id: uuid.UUID | None = Field(default=None)
    file_name: str | None = Field(default=None)
    original_file_name: str | None = Field(default=None)

    created_at: int = Field(default_factory=lambda: int(datetime.now().timestamp()))
    updated_at: int = Field(default_factory=lambda: int(datetime.now().timestamp()))

    @property
    def progress(self) -> float:
        now = datetime.now().timestamp()
        if self.end_date < now:
            return 100.0 
        
        total = self.end_date - self.start_date
        if total == 0:
            return 100.0
        progress = now - self.start_date
        return (progress / total) * 100
    
    @classmethod
    def get_all(
        cls,
        db: Session
    ) -> List["Project"]:
        stmt = select(cls)
        return db.exec(stmt).all() # type: ignore


    @classmethod
    def get_one(
        cls,
        db: Session,
        u_id: uuid.UUID
    ) -> "Project":
        stmt = select(cls).where(cls.u_id == u_id)
        return db.exec(stmt).first() # type: ignore


    @classmethod
    def put_file(
        cls,
        db: Session,
        u_id: uuid.UUID,
        file_id: uuid.UUID | None,
        file_name: str | None,
        original_file_name: str | None
    ):
        stmt = (
            update(cls)
            .where(cls.u_id == u_id) # type: ignore
            .values(
                file_id=file_id,
                file_name=file_name,
                original_file_name=original_file_name
            )
        )        

        result = db.exec(stmt) # type: ignore
        if result.rowcount == 0:
            db.rollback()  # 롤백
            raise ValueError("No rows were updated")
        else:
            db.commit()  # 커밋

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
        content: str | None,
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
                    content=content,
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
                    content=content,
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
        

    @classmethod
    def delete(
        cls,
        db: Session,
        u_id: uuid.UUID
    ):
        stmt = (
            delete(cls)
            .where(cls.u_id == u_id) # type: ignore
        )
        try:
            db.exec(stmt) # type: ignore
            db.commit()
        except Exception as e:
            raise e
        
        return True
