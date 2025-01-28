from pydantic import BaseModel
from datetime import datetime
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field as SQLModelField, Session, select
from .enum import ProgramStatus

class ProgramDTO(BaseModel):
    u_id: UUID
    client_u_id: UUID | None
    status: ProgramStatus

    title: str | None
    description: str | None

    created_at: int
    updated_at: int

class Program(SQLModel, table=True):
    u_id: UUID = SQLModelField(default_factory=uuid4, primary_key=True)
    client_u_id: UUID | None = SQLModelField(default=None)  # 클라이언트 ID
    status: ProgramStatus = SQLModelField(default=ProgramStatus.INTEREST)  # 기본값: 관심 단계

    title: str | None = SQLModelField(default=None)  # 프로그램명
    description: str | None = SQLModelField(default=None)  # 프로그램 설명

    created_at: int = SQLModelField(nullable=True, default_factory=lambda: int(datetime.now().timestamp()))
    updated_at: int = SQLModelField(nullable=True, default_factory=lambda: int(datetime.now().timestamp()))

    @classmethod
    def get_by_client_id(cls, db: Session, client_id: UUID):
        return db.exec(select(cls).where(cls.client_u_id == client_id)).all()

    @classmethod
    def get_all(cls, db: Session):
        return db.exec(select(cls)).all()

    @classmethod
    def update_status(cls, db: Session, program_id: UUID, new_status: ProgramStatus):
        program = db.exec(select(cls).where(cls.u_id == program_id)).first()
        if program:
            program.status = new_status
            db.add(program)
            db.commit()
            return program
        return None