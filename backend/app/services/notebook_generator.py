from google.cloud import storage
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

    with tempfile.NamedTemporaryFile(mode='w+', suffix=".ipynb", delete=False) as tmp:
        nbformat.write(nb, tmp)
        tmp.flush()

        client = storage.Client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(filename)
        blob.upload_from_filename(tmp.name)

    return filename