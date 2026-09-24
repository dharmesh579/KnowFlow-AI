import type { ChatResponse } from "../services/api";
import SourceCard from "./SourceCard";

export default function ChatMessage({ response }: { response: ChatResponse }) {
  return (
    <div className="mb-8">
      <p className="font-mono text-xs text-stone mb-1">You</p>
      <p className="text-ink mb-4">{response.question}</p>

      <div className="flex items-center gap-2 mb-1">
        <p className="font-mono text-xs text-stone">Assistant</p>
        <span className="font-mono text-[10px] text-accent bg-accent-soft px-1.5 py-0.5 rounded">
          {response.route}
        </span>
      </div>
      <p className="text-ink leading-relaxed whitespace-pre-wrap">
        {response.answer}
      </p>

      <SourceCard response={response} />
    </div>
  );
}
