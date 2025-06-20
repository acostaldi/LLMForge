from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.routes import generate_notebook, get_notebook_url, notebook

app = FastAPI()

# Define allowed origins
origins = [
    "https://llm-forge.vercel.app",  # Production
    "https://llm-forge-git-dev-amadeo-costaldis-projects.vercel.app", #Dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate_notebook.router)
app.include_router(get_notebook_url.router)
app.include_router(notebook.router)

#Test comment
# Request body schema for testing
class ChatRequest(BaseModel):
    deployment_id: str
    message: str
    settings: dict = {}
    api_key: str = None  # Optional for future auth

@app.post("/api/chat")
async def chat(req: ChatRequest):
    return {"response": f"Echo: {req.message}"}