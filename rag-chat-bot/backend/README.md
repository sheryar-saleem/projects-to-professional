# DocMind Backend

FastAPI backend for **DocMind — AI-Powered Enterprise Knowledge Assistant**.

## Run on Windows

```powershell
cd backend
uv sync
uv run uvicorn main:app --reload
```

Create `.env` from your Azure configuration:

```env
PROJECT_ENDPOINT=https://...
AGENT_NAME=...
AGENT_VERSION=...
CORS_ORIGINS=http://localhost:3000
MAX_UPLOAD_MB=25
# Optional Azure Search configuration for future direct retrieval/indexing:
AZURE_SEARCH_ENDPOINT=https://...
AZURE_SEARCH_INDEX=...
```

The backend provides persistent SQLite conversation/document metadata under `backend/data`, document extraction for PDF/DOCX/TXT/CSV/XLSX/PPTX, health monitoring, safe error responses, and the existing Azure AI Agent chat integration.

## Important

Uploaded files are treated as untrusted data. Filenames are normalized, extensions are allow-listed, size is capped, and no uploaded content is executed.
