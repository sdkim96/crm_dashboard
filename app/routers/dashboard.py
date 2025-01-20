from fastapi import (
    APIRouter, 
    Query,
)
from datetime import datetime, timedelta
from app.deps import (
    RequestDep, 
    SessionDep,
    UserDep
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
    PutModifyProjectResponse
)
from app.core import chat


dashboard_r = APIRouter()

@dashboard_r.get("", response_model=GetDashboardResponse)
async def get_dashboard(
    request_id: RequestDep,
    category: ProjectCategory = Query(None),
    priority: ProjectPriority = Query(None),
    query: str = Query(None),
    date_filter: ProjectDateFilter = Query(None),
    offset: int = Query(0),
    limit: int = Query(10)

    # me = Depends(get_current_user)
):
    print(request_id)

@dashboard_r.post("/create", response_model=PostCreateProjectResponse)
async def create_project(
    request_id: RequestDep,
    db: SessionDep,
    me: UserDep,
    body: PostCreateProjectRequest
):
    """
    mock:
        1. 일반적인 프로젝트 생성 요청
        2. 간단한 요청 (추론이 필요한 경우)
        3. 복잡한 프로젝트 세부 정보 포함
        4. 정보가 부족한 경우 (기본값 테스트)
        5. 실험적인 아이디어
        6. 시간 제약이 있는 요청

        1. 새로운 마케팅 켐페인을 준비하고 있습니다. 소셜 미디어 플랫폼에서의 도달 향상을 목표로 하여 3개월 동안 진행될 예정입니다.
        2. "빠르게 개발할 수 있는 웹 애플리케이션 프로젝트가 필요합니다."
        3. "기업 내 팀 간 협업을 개선하기 위한 프로젝트를 계획 중입니다. 이 프로젝트는 2025년 2월 1일에 시작해 2025년 5월 31일까지 완료를 목표로 하며, HR과 IT 팀이 주도합니다. 우선순위는 높음입니다."
        4. "프로젝트에 대한 자세한 정보를 아직 정하지 못했습니다."
        5. "AI를 활용한 이미지 분석 도구를 만드는 프로젝트를 고려 중입니다. 이 도구는 중소기업이 제품 이미지를 더 효율적으로 관리할 수 있도록 돕는 것을 목표로 합니다."
        6. "이벤트 관리 시스템 개발 프로젝트를 빠르게 시작하고 싶습니다. 2주 안에 프로토타입을 완성해야 합니다."
        
    
    """
    raw: str = f"""
    ## Persona
    당신은 좋은 프로젝트를 만들기 위해 노력하는 프로젝트 매니저입니다.

    ## 목표
    1. 당신의 목표는 <query>를 바탕으로 프로젝트의 메타데이터를 생성하는 것입니다. 프로젝트의 메타데이터는 프로젝트의 카테고리, 우선순위, 날짜 필터 등을 포함합니다.
    2. <query>에서 프로젝트에 대한 정보를 최대한 추출해야합니다. 만약 <query>에서 프로젝트의 메타데이터를 추출할 수 없다면, <default> 값을 참고해서 생성하세요. 

    ## 참고
    - title은 프로젝트의 제목입니다.
    - summary는 프로젝트 내용의 요약입니다.
    
    - priority는 프로젝트의 우선순위입니다. 
    - category는 프로젝트의 카테고리입니다.

    - start_date는 프로젝트의 시작 날짜입니다.
    - end_date는 프로젝트의 종료 날짜입니다.

    - <default>
        - title: 제목 없음
        - summary: 요약 없음
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

    response: chat.ProjectGPTResponse | None = await chat.infer(prompt, chat.ResponseOption.PROJECT) # type: ignore

    if response:
        user_message = Message(content=body.query, role=Role.USER, parent_id=body.parent_id)
        thread.add_message(user_message)
        
        assistant_message = Message(content=response.summary, role=Role.ASSISTANT, parent_id=user_message.u_id)
        thread.add_message(assistant_message)

        thread.commit_current(db)

        Project.put(db, response)

    return PostCreateProjectResponse(status=bool(response))
    

@dashboard_r.put("/modify", response_model=PutModifyProjectResponse)
async def modify_project(
    request_id: RequestDep,
    db: SessionDep,
    me: UserDep,
    body: PutModifyProjectRequest
):
    
    Project.put(db, body)

    return PutModifyProjectResponse(request_id=request_id, status=True)