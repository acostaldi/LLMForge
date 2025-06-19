from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.cloud import storage
from google.oauth2 import service_account
import os
import json

router = APIRouter()

class UpdateRequest(BaseModel):
    deployment_id: str
    notebook: dict

@router.get("/api/notebook/{path:path}")
async def get_notebook(path: str):
    bucket_name = os.getenv("LLMFORGE_NOTEBOOKS")
    key_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "/secrets/llmforge-sa-key/llmforge-backend-service-key")

    if not bucket_name:
        raise RuntimeError("LLMFORGE_NOTEBOOKS environment variable not set")
    if not os.path.exists(key_path):
        raise RuntimeError(f"Service account key not found at: {key_path}")

    credentials = service_account.Credentials.from_service_account_file(key_path)
    client = storage.Client(credentials=credentials)
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(path)

    if not blob.exists():
        raise HTTPException(status_code=404, detail="Notebook not found")

    content = blob.download_as_text()
    return {"notebook": json.loads(content)}

@router.post("/api/notebook/update")
async def update_notebook(req: UpdateRequest):
    bucket_name = os.getenv("LLMFORGE_NOTEBOOKS")
    key_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "/secrets/llmforge-sa-key/llmforge-backend-service-key")

    if not bucket_name:
        raise RuntimeError("LLMFORGE_NOTEBOOKS environment variable not set")
    if not os.path.exists(key_path):
        raise RuntimeError(f"Service account key not found at: {key_path}")

    credentials = service_account.Credentials.from_service_account_file(key_path)
    client = storage.Client(credentials=credentials)
    bucket = client.bucket(bucket_name)
    filename = f"{req.deployment_id}.ipynb"
    blob = bucket.blob(filename)
    blob.upload_from_string(json.dumps(req.notebook), content_type="application/json")
    return {"path": filename}

@router.get("/api/notebook/template")
async def notebook_template():
    return {
        "nbformat": 4,
        "nbformat_minor": 5,
        "metadata": {},
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": ["# Your Colab Notebook\n", "Edit cells below…"],
            },
            {
                "cell_type": "code",
                "metadata": {},
                "source": ["print('Hello, world!')"],
            },
        ],
    }
