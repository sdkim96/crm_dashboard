import openai
import asyncio

from app.core.config import settings
from app.models import Prompt

class Chat:

    def __init__(
        self,
        temperature: float = 0.8,
    ) -> None:
        
        api_key = settings.OPENAI_API_KEY

    
    async def ainvoke(self, prompt: Prompt):
        pass


    async def astream(self, prompt: Prompt):
        pass