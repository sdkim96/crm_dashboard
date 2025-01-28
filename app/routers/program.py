from fastapi import APIRouter

program_r = APIRouter()

@program_r.get("/start")
async def start_program():
    return {"message": "Program started!"}