from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.cloud import storage
from google.oauth2 import service_account
import os
from datetime import timedelta

router = APIRouter()

class NotebookAccessRequest(BaseModel):
    notebook_path: str  # e.g., "user123/abc123.ipynb"

@router.post("/api/get-notebook-url")
async def get_notebook_url(req: NotebookAccessRequest):
    bucket_name = os.getenv("LLMFORGE_NOTEBOOKS")
    key_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "/secrets/llmforge-sa-key/llmforge-backend-service-key")

    if not bucket_name:
        raise RuntimeError("LLMFORGE_NOTEBOOKS environment variable not set")

    if not os.path.exists(key_path):
        raise RuntimeError(f"Service account key not found at: {key_path}")

    # Load credentials from service account key
    try:
        credentials = service_account.Credentials.from_service_account_file(key_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load credentials: {str(e)}")

    client = storage.Client(credentials=credentials)
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(req.notebook_path)

    if not blob.exists():
        raise HTTPException(status_code=404, detail="Notebook not found")

    try:
        url = blob.generate_signed_url(
            version="v4",
            expiration=timedelta(minutes=15),
            method="GET",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate signed URL: {str(e)}")

    return {"signed_url": url}