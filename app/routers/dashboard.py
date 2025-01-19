from fastapi import (
    APIRouter, 
    Depends, 
    HTTPException, 
    status, 
    Query
)
from typing import Annotated
from app.deps import get_current_user
from app.models import (
    ProjectCategory, 
    ProjectPriority, 
    ProjectDateFilter,
    GetDashboardResponse
)

dashboard_r = APIRouter()

@dashboard_r.get("", response_model=GetDashboardResponse)
async def get_dashboard(
    category: ProjectCategory = Query(None),
    priority: ProjectPriority = Query(None),
    query: str = Query(None),
    date_filter: ProjectDateFilter = Query(None),
    offset: int = Query(0),
    limit: int = Query(10),

    # me = Depends(get_current_user)

):
    print(type(category))
    