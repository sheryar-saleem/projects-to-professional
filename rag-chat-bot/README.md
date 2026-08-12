# DocMind

**AI-Powered Enterprise Knowledge Assistant**

DocMind is a RAG-oriented enterprise knowledge assistant using Next.js, FastAPI, Azure AI Foundry, and Azure AI Search.

## Architecture

Next.js → FastAPI → Azure AI Agent / Azure AI Search → grounded response

The application also provides SQLite-backed conversation history and document ingestion metadata.

## Features

- Persistent conversations
- Multi-format document upload: PDF, DOCX, TXT, CSV, XLSX, PPTX
- Document validation and processing status
- Real health endpoint
- Admin metrics
- Secure server-side Azure configuration
- Markdown answer rendering
- Prompt-injection-aware agent instructions
- Knowledge-base boundary behavior
- Obsidian & Emerald enterprise UI

## Start

Backend:

```powershell
cd backend
uv sync
uv run uvicorn main:app --reload
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Azure configuration

Set `PROJECT_ENDPOINT`, `AGENT_NAME`, and `AGENT_VERSION` in `backend/.env`. Azure authentication uses `DefaultAzureCredential`.

Never place credentials in frontend environment variables.

## Notes

The existing Azure Agent remains the chat retrieval authority. The document pipeline extracts, cleans, chunks, and tracks ingestion locally; direct Azure AI Search indexing requires a configured Search index and is intentionally kept separate from the existing agent integration until the target index schema/embedding deployment is known.
