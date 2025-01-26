from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models import BizClient, BizClientDTO, BusinessCard, GetBizcardsResponse
from app.deps import RequestDep, SessionDep

bizcard_r = APIRouter()

@bizcard_r.get("", response_model=GetBizcardsResponse)
async def get_bizcards(
    request_id: RequestDep,
    db: SessionDep
):
    bizclients = BizClient.get_all(db)

    BizClientDTOs = []
    for client in bizclients:
        BizClientDTOs.append(BizClientDTO(
            u_id=client.u_id,
            category=client.category,
            blob_file_name=client.blob_file_name,
            origin_file_name=client.origin_file_name,
            biz_card=BusinessCard.model_validate(client.biz_card)
        ))

    return GetBizcardsResponse(bizcards=BizClientDTOs)