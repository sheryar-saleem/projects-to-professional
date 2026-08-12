"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AlertCircle,
  FileText,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";
import type { View } from "./Chat";

type PanelProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function ViewPanel({ view, api }: { view: View; api: string }) {
  if (view === "documents") return <Documents api={api} />;
  if (view === "admin") return <Admin api={api} />;
  if (view === "settings") return <SettingsView api={api} />;
  return <SearchView />;
}

function Documents({ api }: { api: string }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const response = await fetch(`${api}/documents`);
      if (response.ok) setDocs(await response.json());
    } catch {
      // Leave the current list intact.
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await fetch(`${api}/documents/upload`, {
        method: "POST",
        body: formData,
      });
      await load();
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  async function remove(id: string) {
    await fetch(`${api}/documents/${id}`, { method: "DELETE" });
    await load();
  }

  async function reindex(id: string) {
    await fetch(`${api}/documents/${id}/reindex`, { method: "POST" });
    await load();
  }

  return (
    <Panel
      title="Documents"
      subtitle="Upload and manage the knowledge base"
    >
      <div className="flex items-center justify-between mb-5">
        <label className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-stone-950 cursor-pointer hover:bg-accent-hover">
          <UploadCloud size={16} />
          {busy ? "Uploading…" : "Upload Document"}
          <input
            type="file"
            hidden
            accept=".pdf,.docx,.txt,.csv,.xlsx,.pptx"
            onChange={(event) => void upload(event)}
          />
        </label>

        <button
          onClick={() => void load()}
          className="rounded-lg border border-stone-700 p-2 text-text-muted hover:text-text"
          aria-label="Refresh documents"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {docs.length === 0 ? (
        <EmptyState text="No documents uploaded yet." />
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="rounded-lg border border-stone-700/60 bg-surface-raised/50 p-3 flex items-center gap-3"
            >
              <FileText size={20} className="text-text-muted" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{doc.name}</div>
                <div className="text-xs text-text-muted">
                  {String(doc.extension || "").toUpperCase().replace(".", "")} ·{" "}
                  {((doc.size || 0) / 1024 / 1024).toFixed(1)} MB ·{" "}
                  {doc.chunks || 0} chunks
                </div>
              </div>

              <span
                className={
                  doc.status === "indexed"
                    ? "text-accent"
                    : doc.status === "failed"
                      ? "text-danger"
                      : "text-warning"
                }
              >
                {doc.status}
              </span>

              {doc.status === "failed" && (
                <button
                  onClick={() => void reindex(doc.id)}
                  aria-label="Retry indexing"
                  className="p-2 text-text-muted hover:text-text"
                >
                  <RefreshCw size={15} />
                </button>
              )}

              <button
                onClick={() => void remove(doc.id)}
                aria-label="Delete document"
                className="p-2 text-text-muted hover:text-danger"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function Admin({ api }: { api: string }) {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`${api}/admin/metrics`);
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) setMetrics(data);
      } catch {
        // Keep loading state if the backend is unavailable.
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [api]);

  if (!metrics) {
    return (
      <Panel
        title="Admin Dashboard"
        subtitle="Loading real system metrics…"
      >
        <div className="animate-pulse text-text-muted">Loading…</div>
      </Panel>
    );
  }

  const cards = [
    ["Documents", metrics.documents?.total ?? 0],
    ["Indexed", metrics.documents?.indexed ?? 0],
    ["Conversations", metrics.conversations ?? 0],
    ["Questions today", metrics.questions_today ?? 0],
  ];

  return (
    <Panel
      title="Admin Dashboard"
      subtitle="Operational metrics from the running system"
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-stone-700/60 bg-surface-raised p-4"
          >
            <div className="text-xs text-text-muted">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{String(value)}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-stone-700/60 p-4">
        <div className="text-sm font-semibold">Performance</div>
        <div className="mt-2 text-sm text-text-muted">
          Average response time:{" "}
          {metrics.average_response_time_ms
            ? `${metrics.average_response_time_ms} ms`
            : "Unavailable"}
        </div>
        <div className="text-sm text-text-muted">
          Average retrieval score:{" "}
          {metrics.average_retrieval_score ?? "Unavailable"}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-stone-700/60 p-4">
        <div className="text-sm font-semibold">Recent errors</div>
        {metrics.recent_errors?.length ? (
          metrics.recent_errors.map((error: any) => (
            <div key={error.id} className="mt-2 text-xs text-danger">
              {error.message} · {new Date(error.created_at).toLocaleString()}
            </div>
          ))
        ) : (
          <div className="mt-2 text-xs text-text-muted">
            No recorded errors.
          </div>
        )}
      </div>
    </Panel>
  );
}

function SettingsView({ api }: { api: string }) {
  const [settings, setSettings] = useState<Record<string, unknown> | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`${api}/settings/public`);
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) setSettings(data);
      } catch {
        // Keep loading state.
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [api]);

  return (
    <Panel
      title="Settings"
      subtitle="Non-secret runtime configuration"
    >
      {settings ? (
        <div className="space-y-3 text-sm">
          {Object.entries(settings).map(([key, value]) => (
            <div
              key={key}
              className="flex justify-between gap-5 border-b border-stone-700/50 pb-3"
            >
              <span className="text-text-muted">
                {key.replaceAll("_", " ")}
              </span>
              <span className="text-right">
                {Array.isArray(value) ? value.join(", ") : String(value)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        "Loading…"
      )}
    </Panel>
  );
}

function SearchView() {
  const [query, setQuery] = useState("");

  return (
    <Panel
      title="Search"
      subtitle="Search your stored conversation history and knowledge workspace"
    >
      <div className="rounded-lg border border-stone-700 bg-surface-raised flex gap-2 p-2">
        <Search size={18} className="m-2 text-text-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search terms…"
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>

      <div className="mt-4 rounded-lg border border-indigo-400/20 bg-indigo-400/5 p-4 text-sm text-text-muted">
        <AlertCircle size={16} className="inline mr-2 text-indigo-300" />
        Global document search requires a configured Azure AI Search index. The
        chat path remains available through the configured Azure Agent.
      </div>
    </Panel>
  );
}

function Panel({ title, subtitle, children }: PanelProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl p-5 lg:p-8">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
        <div className="mt-6 rounded-2xl border border-stone-700/60 bg-surface p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-10 text-center text-sm text-text-muted">{text}</div>
  );
}
