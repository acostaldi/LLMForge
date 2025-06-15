from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.cloud import storage
import os
from datetime import timedelta

router = APIRouter()

class NotebookAccessRequest(BaseModel):
    notebook_path: str  # e.g., "user123/abc123.ipynb"

@router.post("/api/get-notebook-url")
async def get_notebook_url(req: NotebookAccessRequest):
    bucket_name = os.getenv("LLMFORGE_NOTEBOOKS")
    if not bucket_name:
        raise HTTPException(status_code=500, detail="Notebook bucket not configured")

    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(req.notebook_path)

    if not blob.exists():
        raise HTTPException(status_code=404, detail="Notebook not found")

    url = blob.generate_signed_url(
        version="v4",
        expiration=timedelta(minutes=15),  # temporary access
        method="GET",
    )

    return {"signed_url": url}