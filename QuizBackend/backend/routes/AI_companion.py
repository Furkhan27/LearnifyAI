# backend/routes/ai_companion.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

OPENROUTER_API_KEY = "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"
if not OPENROUTER_API_KEY:
    print("WARNING: OPENROUTER_API_KEY not set in .env")

class AIRequest(BaseModel):
    question: str

class AIResponse(BaseModel):
    answer: str

@router.post("/ai-companion", response_model=AIResponse)
async def ai_companion(req: AIRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured")

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "meta-llama/llama-3.1-70b-instruct",  # choose your model
        "messages": [
            {"role": "system", "content": "You are a friendly AI tutor."},
            {"role": "user", "content": req.question}
        ],
        "temperature": 0.5
    }

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            answer = data.get("choices", [{}])[0].get("message", {}).get("content", "No answer returned.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenRouter API error: {e}")

    return {"answer": answer}
