import uuid

from pydantic import BaseModel, Field
from typing import List
from .dashboard import Project

class BaseResponse(BaseModel):
    request_id: uuid.UUID = Field(default_factory=uuid.uuid4)

class GetDashboardResponse(BaseResponse):
    projects: List[Project]