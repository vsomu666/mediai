from dotenv import load_dotenv
import os
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from medical_agent.agent import agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
import json
import re
import logging
import uuid

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Medical Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

session_service = InMemorySessionService()
runner = Runner(
    agent=agent,
    app_name="medical_agent",
    session_service=session_service
)

class AnalyzeRequest(BaseModel):
    age: int
    gender: str
    symptoms: str
    name: str = ""
    medical_history: str = ""

class AnalyzeResponse(BaseModel):
    disease_name: str
    description: str
    risk_level: str
    precautions: list[str]
    things_to_avoid: list[str]
    recommendations: list[str]
    chart_data: dict

def extract_json(text: str) -> dict:
    logger.info(f"Raw agent response: {text}")
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    raise ValueError(f"Could not parse JSON from agent response: {text[:300]}")

@app.get("/debug-key")
async def debug_key():
    key = os.getenv("GROQ_API_KEY", "NOT SET")
    return {"key_set": bool(key), "starts_with": key[:7] if key else ""}

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    prompt = f"Age: {request.age} Gender: {request.gender} Symptoms: {request.symptoms}"
    if request.name:
        prompt += f" Name: {request.name}"
    if request.medical_history:
        prompt += f" Medical History: {request.medical_history}"

    logger.info(f"Prompt: {prompt}")

    try:
        session_id = str(uuid.uuid4())
        user_id = "api_user"

        await session_service.create_session(
            app_name="medical_agent",
            user_id=user_id,
            session_id=session_id
        )

        message = types.Content(
            role="user",
            parts=[types.Part(text=prompt)]
        )

        raw_response = ""
        async for event in runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=message
        ):
            if event.is_final_response():
                if event.content and event.content.parts:
                    raw_response = event.content.parts[0].text
                break

        logger.info(f"Final response: {raw_response}")
        data = extract_json(raw_response)
        return AnalyzeResponse(**data)

    except ValueError as e:
        logger.error(f"Parse error: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Agent error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "agent": "medical_root"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)