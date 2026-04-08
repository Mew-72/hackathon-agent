import os
import urllib.parse
import uvicorn
from fastapi import FastAPI
from dotenv import load_dotenv
from google.adk.cli.fast_api import get_fast_api_app

load_dotenv()

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
print(AGENT_DIR)

DB_USER = os.getenv("DB_USER", "postgres")
RAW_DB_PASS = os.getenv("DB_PASS", "your_password")
DB_PASS = urllib.parse.quote_plus(RAW_DB_PASS)
DB_HOST = os.getenv("DB_HOST", "ALLOYDB_PRIVATE_IP")
DB_NAME = os.getenv("DB_NAME", "postgres")

SESSION_DB_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"

app: FastAPI = get_fast_api_app(
    agents_dir=AGENT_DIR,
    session_service_uri=SESSION_DB_URL,
    allow_origins=["*"],
    web=False,
)

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))