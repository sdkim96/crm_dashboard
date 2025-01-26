from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.db import init_db
from app.deps import get_db
from app.routers import (
    user_r,
    dashboard_r,
    bizcard_r

)
from app.static import UIMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

init_db(db = next(get_db()))

# Set all CORS enabled origins
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(user_r, prefix=f"{settings.API_V1_STR}/users")
app.include_router(dashboard_r, prefix=f"{settings.API_V1_STR}/dashboard")
app.include_router(bizcard_r, prefix=f"{settings.API_V1_STR}/biz")

app.add_middleware(UIMiddleware)