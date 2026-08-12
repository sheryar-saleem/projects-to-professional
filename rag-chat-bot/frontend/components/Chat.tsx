"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Message from "./Message";
import ViewPanel from "./ViewPanel";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Msg = { id?: string; role: "user" | "assistant"; content: string };
export type View = "chat" | "documents" | "search" | "admin" | "settings";

export default function Chat() {
  const [view, setView] = useState<View>("chat");
  const [cid, setCid] = useState<string | null>(null);
  const [title, setTitle] = useState("New conversation");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function newChat() {
    setCid(null);
    setTitle("New conversation");
    setMessages([]);
    setView("chat");
  }

  async function selectConversation(id: string) {
    try {
      const response = await fetch(`${API}/conversations/${id}`);
      if (!response.ok) return;

      const data = await response.json();
      setCid(id);
      setTitle(data.conversation.title);
      setMessages(
        data.messages.map((message: { id: string; role: Msg["role"]; content: string }) => ({
          id: message.id,
          role: message.role,
          content: message.content,
        })),
      );
      setView("chat");
    } catch {
      // Keep the current conversation visible if loading fails.
    }
  }

  async function send() {
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput("");
    setMessages((current) => [...current, { role: "user", content: question }]);
    setLoading(true);

    try {
      const response = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          conversation_id: cid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "The backend returned an error.");
      }

      setCid(data.conversation_id);
      setTitle((current) =>
        current === "New conversation" ? question.slice(0, 60) : current,
      );
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data.response ||
            "I couldn't find information about that in the available knowledge base.",
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Sorry, I couldn't process your request right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex overflow-hidden bg-bg">
      <Sidebar
        conversationId={cid}
        onNewChat={newChat}
        onSelectConversation={selectConversation}
        onNavigate={(nextView) => setView(nextView as View)}
      />

      <section className="flex min-w-0 flex-1 flex-col">
        <Header
          conversationId={cid}
          title={title}
          onTitle={setTitle}
        />

        {view === "chat" ? (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-4xl px-4 py-7 space-y-5">
                {messages.length === 0 && <Empty onNavigate={setView} />}

                {messages.map((message, index) => (
                  <Message
                    key={message.id || index}
                    role={message.role}
                    content={message.content}
                  />
                ))}

                {loading && (
                  <div className="text-xs text-text-muted flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    Assistant is typing…
                  </div>
                )}

                <div ref={bottom} />
              </div>
            </div>

            <div className="border-t border-stone-700/60 bg-surface/80 p-4">
              <div className="mx-auto max-w-4xl">
                <div className="flex items-end gap-2 rounded-xl border border-stone-700 bg-surface-raised p-2 focus-within:border-accent">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void send();
                      }
                    }}
                    rows={1}
                    placeholder="Ask a question from your knowledge base…"
                    className="min-h-11 max-h-32 flex-1 resize-none bg-transparent px-3 py-2 outline-none text-sm"
                  />

                  <button
                    onClick={() => void send()}
                    disabled={loading || !input.trim()}
                    className="h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-stone-950 disabled:opacity-40 hover:bg-accent-hover"
                    aria-label="Send message"
                  >
                    <Send size={16} />
                  </button>
                </div>

                <p className="mt-2 text-center text-[11px] text-text-muted">
                  DocMind uses your indexed knowledge base and will say when
                  information is unavailable.
                </p>
              </div>
            </div>
          </>
        ) : (
          <ViewPanel view={view} api={API} />
        )}
      </section>
    </div>
  );
}

function Empty({ onNavigate }: { onNavigate: (view: View) => void }) {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="max-w-xl text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-xl border border-emerald-500/30 text-emerald-400 grid place-items-center font-bold text-xl">
          D
        </div>
        <h3 className="text-2xl font-semibold">Ask your knowledge base</h3>
        <p className="mt-2 text-sm text-text-muted">
          Upload documents, ask grounded questions, and keep conversations
          organized in DocMind.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => onNavigate("documents")}
            className="rounded-lg border border-stone-700 px-3 py-2 text-sm hover:bg-surface-raised"
          >
            Manage documents
          </button>
          <button
            onClick={() => onNavigate("search")}
            className="rounded-lg border border-stone-700 px-3 py-2 text-sm hover:bg-surface-raised"
          >
            Search knowledge
          </button>
        </div>
      </div>
    </div>
  );
}
