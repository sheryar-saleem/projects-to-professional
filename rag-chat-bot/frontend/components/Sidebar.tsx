"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  FileText,
  History,
  LayoutDashboard,
  MessageSquarePlus,
  Search,
  Settings,
  Trash2,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Props = {
  conversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onNavigate: (view: string) => void;
};

type Conversation = {
  id: string;
  title: string;
  updated_at: string;
};

type Health = {
  backend?: string;
  azure_ai?: string;
  search?: string;
};

export default function Sidebar({
  conversationId,
  onNewChat,
  onSelectConversation,
  onNavigate,
}: Props) {
  const [items, setItems] = useState<Conversation[]>([]);
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [conversationResponse, healthResponse] = await Promise.all([
          fetch(`${API}/conversations`),
          fetch(`${API}/health`),
        ]);

        if (cancelled) return;

        if (conversationResponse.ok) {
          setItems(await conversationResponse.json());
        }

        if (healthResponse.ok) {
          setHealth(await healthResponse.json());
        }
      } catch {
        if (!cancelled) {
          setHealth(null);
        }
      }
    }

    void load();

    const timer = window.setInterval(() => {
      void load();
    }, 20000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [conversationId]);

  async function remove(id: string) {
    try {
      await fetch(`${API}/conversations/${id}`, { method: "DELETE" });
      if (id === conversationId) onNewChat();
    } finally {
      try {
        const response = await fetch(`${API}/conversations`);
        if (response.ok) setItems(await response.json());
      } catch {
        // Keep the current list if refresh fails.
      }
    }
  }

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-stone-700/60 bg-surface">
      <div className="p-5 border-b border-stone-700/60">
        <button
          onClick={() => onNavigate("chat")}
          className="text-left"
          aria-label="Open DocMind chat"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg border border-emerald-500/40 text-emerald-400 grid place-items-center font-bold">
              D
            </div>
            <div>
              <h1 className="font-semibold tracking-tight">DocMind</h1>
              <p className="text-[11px] text-text-muted">
                Enterprise Knowledge Assistant
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={onNewChat}
          className="mt-5 w-full rounded-lg bg-accent px-3 py-2.5 text-sm font-semibold text-stone-950 hover:bg-accent-hover active:scale-[.98] transition flex items-center justify-center gap-2"
        >
          <MessageSquarePlus size={17} />
          New Chat
        </button>
      </div>

      <nav className="p-3 space-y-1 border-b border-stone-700/60">
        <Nav icon={<FileText size={16} />} label="Documents" onClick={() => onNavigate("documents")} />
        <Nav icon={<Search size={16} />} label="Search" onClick={() => onNavigate("search")} />
        <Nav icon={<LayoutDashboard size={16} />} label="Admin Dashboard" onClick={() => onNavigate("admin")} />
        <Nav icon={<Settings size={16} />} label="Settings" onClick={() => onNavigate("settings")} />
      </nav>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center gap-2 px-2 py-2 text-xs font-semibold text-text-muted">
          <History size={14} />
          Conversation History
        </div>

        {items.length === 0 && (
          <p className="px-2 py-3 text-xs text-text-muted">
            No conversations yet.
          </p>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className={`group flex items-center gap-1 rounded-lg ${
              item.id === conversationId
                ? "bg-surface-raised"
                : "hover:bg-surface-raised/70"
            }`}
          >
            <button
              onClick={() => onSelectConversation(item.id)}
              className="min-w-0 flex-1 px-2 py-2.5 text-left"
            >
              <div className="truncate text-sm">{item.title}</div>
              <div className="truncate text-[11px] text-text-muted">
                {new Date(item.updated_at).toLocaleString()}
              </div>
            </button>

            <button
              onClick={() => void remove(item.id)}
              className="p-2 text-text-muted hover:text-danger"
              aria-label="Delete conversation"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-stone-700/60 p-4">
        <div className="text-xs text-text-muted mb-2">System Status</div>
        <Status label="Backend" value={health?.backend} />
        <Status label="Azure AI" value={health?.azure_ai} />
        <Status label="Search" value={health?.search} />
      </div>
    </aside>
  );
}

function Nav({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text hover:bg-surface-raised transition"
    >
      {icon}
      {label}
    </button>
  );
}

function Status({ label, value }: { label: string; value?: string }) {
  const ok = value === "healthy" || value === "configured";

  return (
    <div className="flex items-center justify-between text-xs py-1">
      <span className="text-text-muted">{label}</span>
      <span
        className={
          ok
            ? "text-accent"
            : value === "unavailable"
              ? "text-danger"
              : "text-warning"
        }
      >
        {ok ? "● Online" : `● ${value || "Checking"}`}
      </span>
    </div>
  );
}
