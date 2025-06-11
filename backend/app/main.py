from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request body schema
class ChatRequest(BaseModel):
    deployment_id: str
    message: str
    settings: dict = {}
    api_key: str = None  # Optional for future auth

@app.post("/api/chat")
async def chat(req: ChatRequest):
    # For now, just echo back the message
    return {"response": f"Echo: {req.message}"}