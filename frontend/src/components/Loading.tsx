import { useEffect, useState } from "react";

interface LoadingProps {
  label?: string;
}

export default function Loading({ label = "Thinking…" }: LoadingProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const message =
    elapsedSeconds >= 8
      ? "Still working — web searches and larger documents can take a bit longer…"
      : label;

  return (
    <div
      className="flex items-center gap-2 font-mono text-xs text-stone"
      role="status"
      aria-live="polite"
    >
      <span className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-stone animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-stone animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-stone animate-bounce" />
      </span>
      <span>{message}</span>
    </div>
  );
}
