import uuid
import io
from fastapi import (
    APIRouter, 
    Query,
    UploadFile,
    File,
    Form,
)
from fastapi.responses import StreamingResponse
from typing import Annotated
from datetime import datetime, timedelta
from urllib.parse import quote
from app.deps import (
    RequestDep, 
    SessionDep,
    UserDep,
    BlobClientDep
)
from app.models import (
    ProjectCategory, 
    ProjectPriority, 
    ProjectDateFilter,
    PostCreateProjectRequest,
    Prompt,
    GetDashboardResponse,
    PostCreateProjectResponse,
    Project,
    Thread,
    Message,
    Role,
    PutModifyProjectRequest,
    PutModifyProjectResponse,
    PostDashboardUploadFileResponse,
    DeleteDashboardResponse,
    ProjectDTO
)
from app.modules import llm, blob


dashboard_r = APIRouter()

@dashboard_r.get("", response_model=GetDashboardResponse)
async def get_dashboard(
    request_id: RequestDep,
    db: SessionDep,
    category: ProjectCategory | None = Query(None),
    priority: ProjectPriority | None = Query(None),
    query: str | None = Query(None),
    date_filter: ProjectDateFilter | None = Query(None),
    offset: int = Query(0),
    limit: int = Query(10)

    # me = Depends(get_current_user)
):
    projects = Project.filter(
        db,
        category,
        priority,
        query,
        date_filter,
        offset,
        limit 
    )

    projects_dto=[
        ProjectDTO(
            u_id=p.u_id,
            title=p.title,
            summary=p.summary,
            priority=p.priority,
            category=p.category,
            start_date=p.start_date,
            end_date=p.end_date,
            file_id=p.file_id,
            file_name=p.file_name,
            original_file_name=p.original_file_name,
        ) for p in projects
    ]

    return GetDashboardResponse(projects=projects_dto)

@dashboard_r.post("/create", response_model=PostCreateProjectResponse)
async def create_project(
    request_id: RequestDep,
    db: SessionDep,
    me: UserDep,
    body: PostCreateProjectRequest
):
    raw: str = f"""
    ## Persona
    당신은 좋은 프로젝트를 만들기 위해 노력하는 프로젝트 매니저입니다.

    ## 목표
    1. 당신의 목표는 <query>를 바탕으로 프로젝트의 메타데이터와 내용을 생성하는 것입니다. 프로젝트의 메타데이터는 프로젝트의 카테고리, 우선순위, 날짜 필터 등을 포함합니다.
    2. <query>에서 프로젝트에 대한 정보를 최대한 추출해야합니다. 만약 <query>에서 프로젝트의 데이터를 추출할 수 없다면, <default> 값을 참고해서 생성하세요. 

    ## 참고
    - title은 프로젝트의 제목입니다.
    - summary는 프로젝트 내용의 요약입니다.
    - content는 프로젝트 내용입니다.
    
    - priority는 프로젝트의 우선순위입니다. 
    - category는 프로젝트의 카테고리입니다.

    - start_date는 프로젝트의 시작 날짜입니다.
    - end_date는 프로젝트의 종료 날짜입니다.

    - <default>
        - title: 제목 없음
        - summary: 요약 없음
        - content: 내용 없음
        - priority: LOW
        - category: SHORT_TERM
        - start_date: {int(datetime.now().timestamp())}
        - end_date: {int((datetime.now() + timedelta(days=7)).timestamp())}

    ## <query>

    {body.query}

    """
    prompt = Prompt(request_id=request_id, user=me, user_prompt=raw)

    thread = Thread.get_by_user(db, me.u_id)

    if thread is None:
        thread = Thread(user_id=me.u_id, messages=[])

    response: llm.ProjectGPTResponse | None = await llm.infer(prompt, llm.ResponseOption.PROJECT) # type: ignore

    if response:
        user_message = Message(content=body.query, role=Role.USER, parent_id=body.parent_id)
        thread.add_message(user_message)
        
        assistant_message = Message(content=response.content, role=Role.ASSISTANT, parent_id=user_message.u_id)
        thread.add_message(assistant_message)

        thread.commit_current(db)

        Project.put(
            db=db, 
            title=response.title,
            summary=response.summary,
            content=response.content,
            priority=response.priority,
            category=response.category,
            start_date=response.start_date,
            end_date=response.end_date
        )

    return PostCreateProjectResponse(status=bool(response))
    

@dashboard_r.put("/modify", response_model=PutModifyProjectResponse)
async def modify_project(
    request_id: RequestDep,
    db: SessionDep,
    me: UserDep,
    body: PutModifyProjectRequest
):
    
    Project.put(
        db,         
        title=body.title,
        summary=body.summary,
        content=body.content,
        priority=body.priority,
        category=body.category,
        start_date=body.start_date,
        end_date=body.end_date,
        u_id=body.u_id,
    )

    return PutModifyProjectResponse(request_id=request_id, status=True)


@dashboard_r.delete("/delete", response_model=DeleteDashboardResponse)
async def delete_project(
    request_id: RequestDep,
    db: SessionDep,
    blob_client: BlobClientDep,
    u_id: Annotated[uuid.UUID, Query(...)]
):
    one = Project.get_one(db, u_id)

    if one is None:
        raise ValueError("No found")
    
    if one.file_name:
        blob.delete_blob(blob_client, one.file_name)

    deleted = Project.delete(db, u_id)

    return DeleteDashboardResponse(status=deleted)


@dashboard_r.post("/upload_file", response_model=PostDashboardUploadFileResponse)
async def upload_file(
    request_id: RequestDep,
    me: UserDep,
    db: SessionDep,
    blob_client: BlobClientDep,
    u_id: Annotated[uuid.UUID, Form(...)],
    file: Annotated[UploadFile, File(...)]
):
    if file.filename is None:
        raise ValueError("No file name")
    
    random_file_id = uuid.uuid4()
    extension = file.filename.split(".")[-1]
    blob_name = f"{str(random_file_id)}.{extension}"
    file_bytes = file.file.read()

    meta = blob.upload_blob_stream(blob_client, blob_name, io.BytesIO(file_bytes))

    if meta:
        Project.put_file(db, u_id, random_file_id, blob_name, file.filename)

    return PostDashboardUploadFileResponse(status=bool(meta))


@dashboard_r.get("/download_file", response_class=StreamingResponse, responses={200: {"content": {
  "application/octet-stream": {
    "schema": {
      "type": "string",
      "format": "binary"
    }
  }
}}})
async def download_file(
    request_id: RequestDep,
    me: UserDep,
    db: SessionDep,
    blob_client: BlobClientDep,
    u_id: Annotated[uuid.UUID, Query(...)],
):
    one = Project.get_one(db, u_id)

    if one is None:
        raise ValueError("No found")
    
    if one.file_name is None:
        raise ValueError("No file name")

    file_stream = blob.download_blob_to_stream(blob_client, one.file_name)
    if file_stream is None:
        raise ValueError("No found")

    filename = one.original_file_name or "file"
    encoded_filename = quote(filename)
    return StreamingResponse(
        file_stream,
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"
        }
    )


@dashboard_r.delete("/delete_file", response_model=DeleteDashboardResponse)
async def delete_file(
    request_id: RequestDep,
    me: UserDep,
    db: SessionDep,
    blob_client: BlobClientDep,
    u_id: Annotated[uuid.UUID, Query(...)],
):
    one = Project.get_one(db, u_id)

    if one is None:
        raise ValueError("No found")
    
    if one.file_name is None:
        raise ValueError("No file name")

    exist = blob.delete_blob(blob_client, one.file_name)

    if exist is None:
        Project.put_file(db, u_id, None, None, None)
        status = True
    else:
        status = False

    return DeleteDashboardResponse(status=status)
