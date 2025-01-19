from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import (
    user_r,
    dashboard_r,
)
from app.static import UIMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

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

app.add_middleware(UIMiddleware)