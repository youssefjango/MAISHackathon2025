import json
import requests
import os

# Automatically find path relative to this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(BASE_DIR, "test_case.json")

# Read test data
with open(JSON_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

# Send request
response = requests.post("http://127.0.0.1:8000/generate-cheatsheet", json=data)

print(response.status_code)
print(response.json())
