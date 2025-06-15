from fastapi import APIRouter
from pydantic import BaseModel
from app.services.notebook_generator import generate_notebook_file

router = APIRouter()

class NotebookRequest(BaseModel):
    model: str
    temperature: float
    top_k: int
    max_tokens: int

@router.post("/api/generate-notebook")
async def generate_notebook(req: NotebookRequest):
    path = generate_notebook_file(
        model=req.model,
        temperature=req.temperature,
        top_k=req.top_k,
        max_tokens=req.max_tokens
    )
    return {"notebook_path": path}