import enum
from datetime import datetime
from pydantic import BaseModel, Field
from openai import AsyncOpenAI
from typing import Type

from app.core.config import settings
from app.models import Prompt, ProjectPriority, ProjectCategory

class ResponseOption(enum.Enum):
    BASE='base'
    PROJECT='project'

class BaseGPTResponse(BaseModel):
    response: str

class ProjectGPTResponse(BaseModel):
    title: str
    summary: str
    
    priority: ProjectPriority = ProjectPriority.LOW
    category: ProjectCategory = ProjectCategory.SHORT_TERM

    start_date: int
    end_date: int

    def convert_datetime_to_int(self, date: datetime):
        return int(date.timestamp())



async def infer(
    prompt: Prompt, 
    response_option: ResponseOption = ResponseOption.BASE,
):
    
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    match response_option:
        case ResponseOption.BASE:
            response_model = BaseGPTResponse
        case ResponseOption.PROJECT:
            response_model = ProjectGPTResponse

    system_prompt = prompt.system_prompt
    user_prompt = prompt.user_prompt

    inferring = await client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format=response_model,
    )

    if inferring.choices[0].message.parsed:
        return inferring.choices[0].message.parsed
    

# async def stream(
#     prompt: Prompt, 
#     response_option: ResponseOption = ResponseOption.BASE,
# ):
#     inferring = await infer(prompt,response_option)

#     match response_option:
#         case ResponseOption.BASE:
#             Streaming(status="질의 의도 이해중..", data=inferring)
#         case ResponseOption.PROJECT:
            
    

