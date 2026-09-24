import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { askQuestion, type ChatResponse } from "../services/api";
import ChatMessage from "./ChatMessage";
import Loading from "./Loading";

interface LocationState {
  documentId?: string;
  filename?: string;
}

export default function ChatWindow() {
  const location = useLocation();
  const { documentId, filename } = (location.state as LocationState) ?? {};

  const [messages, setMessages] = useState<ChatResponse[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;

    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await askQuestion(question, documentId);
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-[70ch] mx-auto px-6 py-8 flex flex-col min-h-[calc(100vh-73px)]">
      {filename && (
        <p className="font-mono text-xs text-stone border-b border-stone-soft pb-3 mb-6">
          Scoped to: {filename}
        </p>
      )}

      <div className="flex-1">
        {messages.length === 0 && !isLoading && (
          <p className="text-stone">
            {documentId
              ? "Ask a question about your document, or anything else."
              : "Ask a question — no document uploaded, so I'll answer directly or search the web."}
          </p>
        )}

        {messages.map((m, i) => (
          <ChatMessage key={i} response={m} />
        ))}

        {isLoading && <Loading label="Thinking…" />}

        {error && (
          <p className="font-mono text-xs text-rust bg-rust-soft border border-rust rounded px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-stone-soft pt-4 mt-4 sticky bottom-0 bg-paper"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything…"
          className="flex-1 border border-stone-soft rounded px-3 py-2 text-ink focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="font-mono text-sm text-paper bg-ink px-4 py-2 rounded hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}
