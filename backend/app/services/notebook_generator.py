import nbformat as nbf
import uuid
import os

def generate_notebook_file(model: str, temperature: float, top_k: int, max_tokens: int) -> str:
    nb = nbf.v4.new_notebook()
    nb['cells'] = [
        nbf.v4.new_markdown_cell(f"# LLM Instance: {model}"),
        nbf.v4.new_code_cell("!pip install transformers"),
        nbf.v4.new_code_cell(f'''
from transformers import pipeline

generator = pipeline("text-generation", model="{model}")
result = generator("Hello, world!", 
                   temperature={temperature}, 
                   top_k={top_k},
                   max_length={max_tokens})
print(result)
''')
    ]

    output_dir = "generated_notebooks"
    os.makedirs(output_dir, exist_ok=True)

    file_id = str(uuid.uuid4())
    file_path = os.path.join(output_dir, f"{file_id}.ipynb")
    with open(file_path, "w", encoding="utf-8") as f:
        nbf.write(nb, f)

    return file_path