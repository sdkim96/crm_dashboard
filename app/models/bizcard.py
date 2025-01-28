import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from sqlmodel import SQLModel, Field as SQLModelField, select, Session, update

from sqlalchemy import func, or_
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql.expression import desc

from .enum import OrderBy

class Company(BaseModel):
    u_id: uuid.UUID = Field(default_factory=uuid.uuid4)
    name: str
    address: str
    english_name: str | None = None
    website: str | None = None

class BusinessCard(BaseModel):
    u_id: uuid.UUID = Field(default_factory=uuid.uuid4)
    name: str
    role: str | None = None
    phone_number: str | None = None
    email: str | None = None

    company: Company

class BizClient(SQLModel, table=True):

    u_id: uuid.UUID = SQLModelField(default_factory=uuid.uuid4, primary_key=True)
    biz_card: dict = SQLModelField(sa_type=JSONB, nullable=False, description="The JSON value stored in the table")  # dict로 변경
    
    category: str
    blob_file_name: str = SQLModelField(nullable=True)
    origin_file_name: str = SQLModelField(nullable=True)

    created_at: int = SQLModelField(nullable=True, default_factory=lambda: int(datetime.now().timestamp()))
    updated_at: int = SQLModelField(nullable=True, default_factory=lambda: int(datetime.now().timestamp()))

    @classmethod
    def get_by_id(cls, db: Session, u_id: uuid.UUID):
        return db.exec(select(cls).where(cls.u_id == u_id)).first()

    @classmethod
    def get_all(cls, db: Session):
        return db.exec(select(cls)).all()
    
    @classmethod
    def filter(
        cls, 
        db: Session,
        query: Optional[str] = None,
        order_by: OrderBy | None = None,
        offset: int = 0,
        limit: int = 10
    ):
        stmt = select(cls).offset(offset).limit(limit)

        if query:
            stmt = stmt.where(
                or_(
                    func.replace(cls.biz_card["name"].astext, ' ', '').ilike(f"%{query}%"),  # 공백 제거 후 검색
                    cls.biz_card["role"].astext.ilike(f"%{query}%"),
                    cls.biz_card["email"].astext.ilike(f"%{query}%"),
                    cls.biz_card["company"]["name"].astext.ilike(f"%{query}%"),
                    cls.biz_card["company"]["address"].astext.ilike(f"%{query}%"),
                    cls.biz_card["company"]["website"].astext.ilike(f"%{query}%"),
                    cls.biz_card["company"]["english_name"].astext.ilike(f"%{query}%"),
                    cls.biz_card["phone_number"].astext.ilike(f"%{query}%")
                )
            )

        # 정렬 조건 설정
        if order_by == OrderBy.CREATED:
            stmt = stmt.order_by(desc(cls.created_at)) # type: ignore
        else:  # 기본 정렬: updated_at
            stmt = stmt.order_by(desc(cls.updated_at)) # type: ignore

        stmt = stmt.offset(offset).limit(limit)
        return db.exec(stmt).all()

    @classmethod
    def update_bizcard(
        cls, 
        db: Session, 
        u_id: uuid.UUID, 
        biz_card: BusinessCard
    ):
        stmt = select(cls).where(cls.u_id == u_id)
        biz_client = db.exec(stmt).first()

        if not biz_client:
            return False
        
        update_stmt = (
            update(cls)
            .where(cls.u_id == u_id) # type: ignore
            .values(
                biz_card=biz_card.model_dump(mode="json"),
                updated_at=int(datetime.now().timestamp())
            )
        )

        try:
            rows = db.exec(update_stmt) # type: ignore
            db.commit()

            if rows.rowcount == 0:
                return False
            
            return True
        except Exception as e:
            db.rollback()
            raise e
        
    

class BizClientDTO(BaseModel):
    
    u_id: uuid.UUID
    category: str
    blob_file_name: str
    origin_file_name: str
    biz_card: BusinessCard