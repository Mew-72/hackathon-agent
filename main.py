# ============ CREDENTIALS BOOTSTRAP — must run before any MCP import ============
import os, json, pathlib

_creds = {
    "token": None,
    "refresh_token": os.getenv("GOOGLE_OAUTH_REFRESH_TOKEN"),
    "token_uri": "https://oauth2.googleapis.com/token",
    "client_id": os.getenv("GOOGLE_OAUTH_CLIENT_ID"),
    "client_secret": os.getenv("GOOGLE_OAUTH_CLIENT_SECRET"),
    "scopes":[
    "https://www.googleapis.com/auth/script.projects",
    "https://www.googleapis.com/auth/chat.spaces.readonly",
    "https://www.googleapis.com/auth/tasks",
    "https://www.googleapis.com/auth/script.deployments.readonly",
    "https://www.googleapis.com/auth/contacts.readonly",
    "https://www.googleapis.com/auth/documents.readonly",
    "https://www.googleapis.com/auth/presentations.readonly",
    "https://www.googleapis.com/auth/script.deployments",
    "https://www.googleapis.com/auth/script.processes",
    "https://www.googleapis.com/auth/chat.messages.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/forms.body.readonly",
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/gmail.settings.basic",
    "openid",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.labels",
    "https://www.googleapis.com/auth/tasks.readonly",
    "https://www.googleapis.com/auth/script.metrics",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/spreadsheets.readonly",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/presentations",
    "https://www.googleapis.com/auth/forms.responses.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/chat.spaces",
    "https://www.googleapis.com/auth/cse",
    "https://www.googleapis.com/auth/contacts",
    "https://www.googleapis.com/auth/script.projects.readonly",
    "https://www.googleapis.com/auth/forms.body",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/chat.messages",
    "https://www.googleapis.com/auth/calendar"
  ],
  "expiry": None
}

_email = os.getenv("GOOGLE_OAUTH_EMAIL")
_creds_path = pathlib.Path.home() / ".google_workspace_mcp" / "credentials" / f"{_email}.json"
_creds_path.parent.mkdir(parents=True, exist_ok=True)
_creds_path.write_text(json.dumps(_creds))
# ================================================================================

# NOW normal imports
import os
import urllib.parse
import uvicorn
from fastapi import FastAPI
from dotenv import load_dotenv
from google.adk.cli.fast_api import get_fast_api_app

load_dotenv()

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))

DB_USER = os.getenv("DB_USER", "postgres")
RAW_DB_PASS = os.getenv("DB_PASS", "your_password")
DB_PASS = urllib.parse.quote_plus(RAW_DB_PASS)
DB_HOST = os.getenv("DB_HOST", "ALLOYDB_PRIVATE_IP")
DB_NAME = os.getenv("DB_NAME", "postgres")

SESSION_DB_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"

app: FastAPI = get_fast_api_app(
    agents_dir=AGENT_DIR,
    # session_service_uri=SESSION_DB_URL,
    allow_origins=["*"],
    web=False,
)

@app.get("/")
def read_root():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))