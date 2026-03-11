import os
import tempfile

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .pdf_processor import extract_text_from_pdf
from openai import OpenAI

# Load .env file from the backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

app = FastAPI()

# simple in-memory store for uploaded document text
DOCUMENT_STORE: dict = {}

frontend_urls = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

extra_frontend_urls = os.getenv("FRONTEND_URLS", "")
if extra_frontend_urls:
    frontend_urls.extend(
        url.strip() for url in extra_frontend_urls.split(",") if url.strip()
    )

# allow react frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_urls,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    question: str

@app.get("/")
def read_root():
    return {"message": "AI Document Assistant backend"}

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    # Save to OS temp dir so it works on both Windows and Linux.
    suffix = os.path.splitext(file.filename or "document.pdf")[1] or ".pdf"
    contents = await file.read()
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_file.write(contents)
        temp_path = temp_file.name

    try:
        text = extract_text_from_pdf(temp_path)
        DOCUMENT_STORE["text"] = text
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    return {"filename": file.filename, "size": len(contents)}

@app.post("/query")
async def query_document(payload: QueryRequest):
    if "text" not in DOCUMENT_STORE:
        return {"error": "no document uploaded"}

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {"error": "OPENAI_API_KEY is not configured"}

    client = OpenAI(api_key=api_key)
    prompt = (
        "Use the following document to answer the question.\n"
        f"Document:\n{DOCUMENT_STORE['text']}\n\n"
        f"Question: {payload.question}\nAnswer:"
    )
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
        )
        answer = response.choices[0].message.content or ""
        return {"question": payload.question, "answer": answer}
    except Exception as exc:
        return {"error": f"failed to query model: {str(exc)}"}
