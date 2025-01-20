import uuid
from typing import List
from datetime import datetime
from pydantic import BaseModel, Field
from sqlmodel import (
    SQLModel, 
    Session, 
    Field as SQLModelField,
    select,
    insert,
    update,
)
from sqlalchemy.dialects.postgresql import JSONB

from app.core.config import settings
from app.models.auth import User
from app.models.enum import Role

SYSTEM_PROMPT = """
당신은 유저의 질문에 답변하는 챗봇입니다.
"""


class PromptConfig(BaseModel):
    temperature: float = Field(default=0.8)
    top_p: float | None = Field(default=None)


class Prompt(BaseModel):

    u_id: uuid.UUID = Field(default_factory=uuid.uuid4)
    request_id: uuid.UUID
    user: User
    system_prompt: str = Field(default=SYSTEM_PROMPT)
    user_prompt: str
    config: PromptConfig | None = Field(default=PromptConfig())

    def __repr__(self) -> str:
        return f"Prompt(request_id={self.request_id}, user={self.user}, user_prompt={self.user_prompt})"


class Message(BaseModel):
    
    content: str
    role: Role

    parent_id: uuid.UUID | None = None
    u_id: uuid.UUID = Field(default_factory=uuid.uuid4)
    
    created_at: datetime = Field(default_factory=datetime.now)


class History(BaseModel):
    
    u_id: uuid.UUID = Field(default_factory=uuid.uuid4)
    user: User
    messages: List[Message]
    

class Thread(SQLModel, table=True):

    __table_args__ = {"extend_existing": True}

    u_id: uuid.UUID = SQLModelField(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = SQLModelField(foreign_key="user.u_id", nullable=False)
    messages: List[dict] = SQLModelField(sa_type=JSONB, nullable=False, description="The JSON value stored in the table")  # dict로 변경
    # thread_type: str = SQLModelField(default="chat")

    created_at: datetime = SQLModelField(default_factory=datetime.now)
    updated_at: datetime = SQLModelField(default_factory=datetime.now)

    summary: str | None = None

    @classmethod
    def get(
        cls, 
        db: Session, 
        u_id: uuid.UUID
    ) -> "Thread | None":
        
        stmt = (
            select(cls)
            .where(cls.u_id == u_id)
        )

        exist = db.exec(stmt).first()
        if exist is None:
            return None
        
        return exist
    
    @classmethod
    def get_by_user(
        cls, 
        db: Session, 
        user_id: uuid.UUID
    ) -> "Thread | None":
        
        stmt = (
            select(cls)
            .where(cls.user_id == user_id)
        )

        exist = db.exec(stmt).first()
        if exist is None:
            return None
        
        return exist
    

    @classmethod
    def put(
        cls, 
        db: Session,
        u_id: uuid.UUID,
        messages: List[dict],
        updated_at: datetime,

        user_id: uuid.UUID | None = None,
        summary: str | None = None,
        created_at: datetime | None = None,                
    ) -> None:
        
        try:            
            statement = select(cls).where(cls.u_id == u_id)
            result = db.exec(statement).first()
            
            # update
            if result:
                stmt = (
                    update(cls)
                    .where(cls.u_id == u_id) # type: ignore
                    .values(messages=messages, updated_at=updated_at)
                )
                db.exec(stmt) # type: ignore

            else:
                stmt = (
                    insert(cls)
                    .values(
                        u_id=u_id,
                        user_id=user_id,
                        messages=messages,
                        created_at=created_at,
                        updated_at=updated_at,
                        summary=summary
                    )
                )
                db.exec(stmt) # type: ignore

            db.commit()
        except Exception as e:
            db.rollback()
            raise e


    def get_history(self, db: Session) -> History:

        entity = User.get_by_id(db, self.user_id)
        if entity is None:
            raise ValueError("유저 정보를 찾을 수 없습니다.")

        messages = [Message.model_validate(msg) for msg in self.messages]
        messages.sort(key=lambda x: x.created_at)
        return History(user=entity, messages=messages)
    

    def add_message(self, message: Message) -> int:
        self.messages.append(message.model_dump(mode="json"))
        return len(self.messages)
    
    def get_messages(self) -> List[Message]:
        return [Message.model_validate(msg) for msg in self.messages]
    
    def commit_current(self, db: Session) -> None:

        Thread.put(
            db, 
            u_id=self.u_id,
            messages=self.messages,
            updated_at=datetime.now(),
            user_id=self.user_id,
            summary=self.summary,
            created_at=self.created_at            
        )




if __name__ == "__main__":

    from app.deps import get_db
    db = next(get_db())

    request_id = uuid.uuid4()
    user = User.get(db, "admin")
    if user is None:
        raise ValueError("유저 정보를 찾을 수 없습니다.")

    thread = Thread.get_by_user(db, user.u_id)

    if thread is None:
        thread = Thread(user_id=user.u_id, messages=[])
    
    user_prompt = "안녕하세요"
    prompt = Prompt(request_id=request_id, user=user, user_prompt=user_prompt)

    user_message = Message(content=prompt.user_prompt, role=Role.USER, parent_id=None)
    count = thread.add_message(user_message)
    print(count)
    
    response = "안녕하세요! 저는 챗봇입니다."
    assistant_message = Message(content=response, role=Role.ASSISTANT, parent_id=user_message.u_id)
    count = thread.add_message(assistant_message)
    print(count)

    thread.commit_current(db)


    