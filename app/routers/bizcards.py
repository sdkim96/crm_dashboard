import uuid
from fastapi import APIRouter
from fastapi import Query
from app.models import (
    BizClient, 
    BizClientDTO, 
    BusinessCard, 
    GetBizcardsResponse, 
    OrderBy,
    PutBizcardsResponse,
    PutBizcardsRequest,
    Program,
    GetBizcardDetailResponse,
    ProgramDTO
)
from app.deps import (
    RequestDep, 
    SessionDep, 
    UserDep
)

bizcard_r = APIRouter()

CONTAINER_NAME = "biz-cards"

@bizcard_r.get("", response_model=GetBizcardsResponse)
async def get_bizcards(
    request_id: RequestDep,
    me: UserDep,
    db: SessionDep,

    query: str | None = Query(None),
    order_by: OrderBy | None = Query(None),
    offset: int = Query(0),
    limit: int = Query(10),

):
    bizclients = BizClient.filter(
        db,
        query,
        order_by,
        offset,
        limit
    )

    biz_dtos = []
    for client in bizclients:
        biz_dtos.append(BizClientDTO(
            u_id=client.u_id,
            category=client.category,
            blob_file_name=client.blob_file_name,
            origin_file_name=client.origin_file_name,
            biz_card=BusinessCard.model_validate(client.biz_card)
        ))

    return GetBizcardsResponse(bizcards=biz_dtos)


@bizcard_r.put("", response_model=PutBizcardsResponse)
async def put_bizcard(
    request_id: RequestDep,
    me: UserDep,
    db: SessionDep,
    body: PutBizcardsRequest
):
    bizcard = BusinessCard(
        u_id=body.biz_card.biz_card.u_id,
        name=body.biz_card.biz_card.name,
        role=body.biz_card.biz_card.role,
        email=body.biz_card.biz_card.email,
        company=body.biz_card.biz_card.company,
        phone_number=body.biz_card.biz_card.phone_number
    )
    updated = BizClient.update_bizcard(
        db,
        body.u_id,
        bizcard
    )

    return PutBizcardsResponse(status=updated)

@bizcard_r.get("/detail", response_model=GetBizcardDetailResponse)
async def get_bizcard_detail(
    request_id: RequestDep,
    me: UserDep,
    db: SessionDep,
    u_id: uuid.UUID
):
    bizclient = BizClient.get_by_id(db, u_id)
    programs = Program.get_by_client_id(db, u_id)
    
    if not bizclient:
        return None
    
    return GetBizcardDetailResponse(
        biz_card=BizClientDTO(
            u_id=bizclient.u_id,
            category=bizclient.category,
            blob_file_name=bizclient.blob_file_name,
            origin_file_name=bizclient.origin_file_name,
            biz_card=BusinessCard.model_validate(bizclient.biz_card)
        ),
        programs=[ProgramDTO(
            u_id=program.u_id,
            client_u_id=program.client_u_id,
            status=program.status,
            title=program.title,
            description=program.description,
            created_at=program.created_at,
            updated_at=program.updated_at
        ) for program in programs]
    )
    


