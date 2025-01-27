import uuid
from pydantic import BaseModel, Field
from sqlmodel import SQLModel, Field as SQLModelField, select, Session
from sqlalchemy.dialects.postgresql import JSONB

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

    @classmethod
    def get_all(cls, db: Session):
        return db.exec(select(cls)).all()
    

class BizClientDTO(BaseModel):
    
    u_id: uuid.UUID
    category: str
    blob_file_name: str
    origin_file_name: str
    biz_card: BusinessCard