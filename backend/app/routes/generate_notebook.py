from fastapi import APIRouter
from pydantic import BaseModel  
from app.services.notebook_generator import generate_notebook_file

router = APIRouter()

class NotebookRequest(BaseModel):
    model: str
    temperature: float
    top_k: int
    max_tokens: int
    user_id: str  

@router.post("/api/generate-notebook")
async def generate_notebook(req: NotebookRequest):
    url = generate_notebook_file(
        model=req.model,
        temperature=req.temperature,
        top_k=req.top_k,
        max_tokens=req.max_tokens,
        user_id=req.user_id
    )
    return {"notebook_url": url}