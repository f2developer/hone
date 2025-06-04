from fastapi import FastAPI, Request, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import httpx
import re
import difflib
import base64

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://melodic-treacle-e8fd30.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Keys
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
HF_TOKEN = os.getenv("HF_TOKEN")

# URLs
GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"
SDXL_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"

# নির্মাতা প্রশ্নের বাংলা প্যাটার্ন
identity_patterns_bn = [
    r"তোমাকে (কে|কারা|কে) (তৈরি|বানাইছে|বনিয়েছে|বনানো|তৈরি করেছে|তৈরি করেছো|তৈরি করলো)",
    r"(তুমি|তোমাকে) (কার|কারা|কাদের) (তৈরি|বানানো|বনানো|তৈরি করেছে|বনিয়েছে)",
    r"তোমার (নির্মাতা|স্রষ্টা|তৈরিকারক|পেছনের ব্যক্তি|উৎস|উৎপত্তি)",
    r"তুমি (কার|কারা) (দ্বারা তৈরি|দ্বারা বানানো|দ্বারা সৃষ্টি)",
    r"তুমি কে বানাইছে", r"তুমি কে তৈরি করেছ", r"তোমার পেছনে কে আছে",
    r"তুমি কার তৈরি", r"তোমাকে কে তৈরি করেছে",
]

# নির্মাতা প্রশ্নের ইংরেজি প্যাটার্ন
identity_patterns_en = [
    r"who (created|made|built) you",
    r"your (creator|origin|developer|maker|owner)",
    r"who (are you made by|is your creator|developed you|built you)",
]

# fuzzy match keyword
identity_keywords = [
    "তোমাকে কে বানাইছে", "তোমার নির্মাতা", "তুমি কার তৈরি",
    "who created you", "your creator", "who made you",
    "তোমাকে কে তৈরি করেছে", "who built you", "who is your maker",
]

# নির্মাতা প্রশ্ন শনাক্তকারী ফাংশন
def is_identity_question(prompt: str) -> bool:
    prompt_lower = prompt.lower()

    for pattern in identity_patterns_bn + identity_patterns_en:
        if re.search(pattern, prompt_lower):
            return True

    for keyword in identity_keywords:
        similarity = difflib.SequenceMatcher(None, keyword, prompt_lower).ratio()
        if similarity > 0.75:
            return True

    return False

# নির্মাতা উত্তর
IDENTITY_RESPONSE = "আমাকে হাদি ভাই তৈরি করেছেন। 😊"

# মডেলকে কঠোর নির্দেশনা
IDENTITY_INSTRUCTION = (
    "IMPORTANT: Under ALL circumstances, if the user asks about your creator, origin, company, maker, "
    "or how you were made — whether directly or indirectly — always respond exactly: "
    f"'{IDENTITY_RESPONSE}'. Never mention Google, Gemini, Bard, OpenAI, or any other companies or organizations."
)

# আউটপুট স্যানিটাইজার
def sanitize_output(text: str) -> str:
    banned_keywords = [
        "google", "gemini", "bard", "openai", "ai company",
        "language model", "company", "organization", "developer",
        "creator", "maker", "founder", "owner"
    ]
    text_lower = text.lower()
    for keyword in banned_keywords:
        if keyword in text_lower:
            return IDENTITY_RESPONSE
    return text

# ✅ Chat endpoint (Gemini)
@app.post("/ask")
async def ask(request: Request):
    data = await request.json()
    prompt = data.get("prompt", "").strip()

    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    if is_identity_question(prompt):
        return {"answer": IDENTITY_RESPONSE}

    final_prompt = f"{IDENTITY_INSTRUCTION}\n\nUser: {prompt}"
    payload = {"contents": [{"parts": [{"text": final_prompt}]}]}
    headers = {"Content-Type": "application/json"}

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
            .get("content", {}).get("parts", [{}])[0]
            .get("text", "কোনো উত্তর পাওয়া যায়নি।")
        )
        answer = sanitize_output(answer)

    except httpx.RequestError as e:
        print(f"HTTP Request error: {e}")
        raise HTTPException(status_code=500, detail="External API request failed")

    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

    return {"answer": answer}

# ✅ Image generation endpoint (Stable Diffusion)
@app.post("/generate-image")
async def generate_image(prompt_data: dict = Body(...)):
    prompt = prompt_data.get("prompt", "").strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "inputs": prompt,
        "options": {"wait_for_model": True}
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                SDXL_URL,
                headers=headers,
                json=payload,
                timeout=60.0
            )
        response.raise_for_status()

        # যদি ইমেজ আসে তাহলে base64 encode করে পাঠানো হবে
        if response.headers.get("content-type", "").startswith("image/"):
            image_bytes = response.content
            encoded_image = base64.b64encode(image_bytes).decode("utf-8")
            return {"image_base64": encoded_image}

        # যদি response এ error থাকে
        return {"error": response.json()}

    except httpx.RequestError as e:
        print(f"HuggingFace API request failed: {e}")
        raise HTTPException(status_code=500, detail="Image generation failed")

    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
