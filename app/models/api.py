import uuid

from pydantic import BaseModel, Field
from typing import List
from .dashboard import ProjectDTO
from .enum import ProjectPriority, ProjectCategory

class BaseResponse(BaseModel):
    request_id: uuid.UUID = Field(default_factory=uuid.uuid4)

class GetDashboardResponse(BaseResponse):
    projects: List[ProjectDTO]

class PostCreateProjectRequest(BaseModel):
    query: str
    thread_id: uuid.UUID
    parent_id: uuid.UUID | None = Field(default=None)
    message_id: uuid.UUID | None = Field(default=None)

class PostCreateProjectResponse(BaseResponse):
    status: bool

class PutModifyProjectRequest(BaseModel):
    u_id: uuid.UUID
    title: str
    summary: str
    content: str | None

    priority: ProjectPriority
    category: ProjectCategory

    start_date: int
    end_date: int

class PutModifyProjectResponse(BaseResponse):
    status: bool

class PostDashboardUploadFileResponse(BaseResponse):
    status: bool

class DeleteDashboardResponse(BaseResponse):
    status: bool