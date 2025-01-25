import jwt
import uuid
from collections.abc import Generator
from azure.storage.blob import BlobServiceClient
from typing import Annotated

from sqlmodel import Session
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError

from app.core.db import engine
from app.core.config import settings
from app.models import Payload, User

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"api/v1/users/sign_in"
)

def get_blob_client():
    return BlobServiceClient.from_connection_string(settings.AZURE_BLOB_KEY)

def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

def get_request():
    return uuid.uuid4()

security = HTTPBearer()

TokenDep = Annotated[str, Depends(reusable_oauth2)]
SessionDep = Annotated[Session, Depends(get_db)]
RequestDep = Annotated[uuid.UUID, Depends(get_request)]
BlobClientDep = Annotated[BlobServiceClient, Depends(get_blob_client)]

def get_current_user(session: SessionDep, token: TokenDep) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=settings.JWT_ALGORITHM)
        payload = Payload(**payload)
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = User.get(db = session, name=payload.sub)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


UserDep = Annotated[User, Depends(get_current_user)]
