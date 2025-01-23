from sqlmodel import (
    create_engine, 
    SQLModel, 
    Session, 
    select
)
    
from app.core.config import settings
from app.models import *

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))

def init_db(db: Session):
    SQLModel.metadata.create_all(engine)

    admin_name = settings.FIRST_SUPERUSER
    admin_pw = settings.FIRST_SUPERUSER_PASSWORD

    exist = User.get(db, admin_name)
    
    if exist:
        return None
    
    User.create(
        db,
        UserCreate(
            name=admin_name, 
            password=admin_pw,
            user_name="관리자",
            user_nickname="관리자",
        ),
    )
