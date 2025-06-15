from google.cloud import storage
from google.oauth2 import service_account
import uuid
import nbformat
import os
import tempfile

def generate_notebook_file(model: str, temperature: float, top_k: int, max_tokens: int, user_id: str) -> str:
    nb = nbformat.v4.new_notebook()
    nb['cells'] = [
        nbformat.v4.new_markdown_cell(f"# LLM Instance: {model}"),
        nbformat.v4.new_code_cell("!pip install transformers"),
        nbformat.v4.new_code_cell(f"""
from transformers import pipeline

generator = pipeline("text-generation", model="{model}")
result = generator("Hello, world!", temperature={temperature}, top_k={top_k}, max_length={max_tokens})
print(result)
""")
    ]

    filename = f"{user_id}/{uuid.uuid4()}.ipynb"
    bucket_name = os.getenv("LLMFORGE_NOTEBOOKS")
    key_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "/secrets/llmforge-sa-key/llmforge-backend-service-key")

    if not bucket_name:
        raise RuntimeError("LLMFORGE_NOTEBOOKS environment variable not set")

    if not os.path.exists(key_path):
        raise RuntimeError(f"Service account key not found at: {key_path}")

    # Use service account credentials
    credentials = service_account.Credentials.from_service_account_file(key_path)
    client = storage.Client(credentials=credentials)

    with tempfile.NamedTemporaryFile(mode='w+', suffix=".ipynb", delete=False) as tmp:
        nbformat.write(nb, tmp)
        tmp.flush()

        bucket = client.bucket(bucket_name)
        blob = bucket.blob(filename)
        blob.upload_from_filename(tmp.name)

    return filename