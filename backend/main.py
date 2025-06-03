from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import httpx  # async HTTP client

load_dotenv()

app = FastAPI()

# CORS: Frontend (Netlify/Vite) থেকে অনুরোধ আসতে দিবে
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # dev এর জন্য
        "http://localhost:5174",  # dev এর জন্য
        "https://melodic-treacle-e8fd30.netlify.app",  # Netlify এর ডোমেইন (প্রডাকশন)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"

@app.post("/ask")
async def ask(request: Request):
    data = await request.json()
    prompt = data.get("prompt", "")

    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ]
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{GEMINI_URL}?key={GOOGLE_API_KEY}",
                headers=headers,
                json=payload,
                timeout=15.0
            )
        response.raise_for_status()
        res_json = response.json()

        answer = (
            res_json.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "কোনো উত্তর পাওয়া যায়নি।")
        )

    except httpx.RequestError as e:
        print(f"HTTP Request error: {e}")
        raise HTTPException(status_code=500, detail="External API request failed")
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

    return {"answer": answer}
