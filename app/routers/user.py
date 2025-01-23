from typing import Annotated
from fastapi import APIRouter
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.models import (
    UserDTO,
    UserCreate, 
    User,
    Token,
    UType,
)
from app.deps import (
    Session, 
    get_db, 
    get_current_user
)

user_r = APIRouter()

@user_r.post("/sign_up", response_model=UserDTO)
async def sign_up(new_user: UserCreate, db: Session = Depends(get_db)):
    
    created = User.create(db, user=new_user)
    if created:
        return UserDTO(
            u_id=created.u_id, 
            name=created.name, 
            user_type=created.user_type,
            user_name=created.user_name,
            user_nickname=created.user_nickname,
        )
    
    raise HTTPException(status_code=500, detail="User already exists")

@user_r.post("/sign_in", response_model=Token)
async def sign_in(user: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)):
    
    me = User.get(db, user.username)

    if not me:
        raise HTTPException(status_code=500, detail="User not found")
    
    if me.verify(user.password):
        token = Token.new(me)
        return token
    else:
        raise HTTPException(status_code=500, detail="Password not matched")


@user_r.get("/me", response_model=UserDTO)
async def get_me(me: User = Depends(get_current_user)):
    return UserDTO(
        u_id=me.u_id, 
        name=me.name,   
        user_type=me.user_type,
        user_name=me.user_name,
        user_nickname=me.user_nickname,
    )