from dotenv import load_dotenv
import os
import requests

load_dotenv()
key = os.getenv('GROQ_API_KEY')
print(f"Key found: {key[:20]}...")

r = requests.post(
    'https://api.groq.com/openai/v1/chat/completions',
    headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'},
    json={'model': 'llama-3.3-70b-versatile', 'messages': [{'role': 'user', 'content': 'hi'}], 'max_tokens': 10}
)
print(r.status_code, r.json())