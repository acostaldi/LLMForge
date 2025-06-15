from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.routes import generate_notebook

app = FastAPI()

# Define allowed origins
origins = [
    "https://llm-forge.vercel.app",  # Production
    "https://llm-forge-git-feature-google-c-d20474-amadeo-costaldis-projects.vercel.app",  # Preview branch
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate_notebook.router)

# Request body schema for testing
class ChatRequest(BaseModel):
    deployment_id: str
    message: str
    settings: dict = {}
    api_key: str = None  # Optional for future auth

@app.post("/api/chat")
async def chat(req: ChatRequest):
    return {"response": f"Echo: {req.message}"}