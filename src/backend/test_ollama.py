import requests

OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.1:8b"

payload = {
    "model": MODEL_NAME,
    "prompt": "Write 3 bullet points about Linear Algebra.",
    "stream": False
}

try:
    response = requests.post(OLLAMA_API_URL, json=payload)
    response.raise_for_status()
    data = response.json()
    print("Ollama response:", data.get("response"))
except Exception as e:
    print("Error connecting to Ollama:", e)
