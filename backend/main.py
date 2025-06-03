from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import requests

load_dotenv()

app = FastAPI()

# CORS: Frontend থেকে অনুরোধ আসতে দিতে হবে
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Vite dev server
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

    response = requests.post(
        f"{GEMINI_URL}?key={GOOGLE_API_KEY}",
        headers=headers,
        json=payload
    )

    res_json = response.json()
    print("Gemini Response:", res_json)

    try:
        answer = (
            res_json.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "কোনো উত্তর পাওয়া যায়নি।")
        )
    except Exception:
        answer = "কোনো উত্তর পাওয়া যায়নি।"

    return {"answer": answer}
