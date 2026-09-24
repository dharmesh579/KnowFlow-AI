import type { ChatResponse, DocumentSource, WebSource } from "../services/api";

function isWebSource(s: DocumentSource | WebSource): s is WebSource {
  return "url" in s;
}

export default function SourceCard({ response }: { response: ChatResponse }) {
  if (response.route === "DOCUMENT_WEB") {
    const { documentSources, webSources } = response;
    if (documentSources.length === 0 && webSources.length === 0) return null;

    return (
      <div className="mt-3 space-y-3">
        {documentSources.length > 0 && (
          <div>
            <p className="font-mono text-xs text-stone mb-1">
              📄 Document sources
            </p>
            <ul className="space-y-1">
              {documentSources.map((s, i) => (
                <li key={i} className="font-mono text-xs text-ink">
                  {s.filename}
                  {s.page ? `, page ${s.page}` : ""}{" "}
                  <span className="text-stone">· {s.score.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {webSources.length > 0 && (
          <div>
            <p className="font-mono text-xs text-stone mb-1">🌐 Web sources</p>
            <ul className="space-y-1">
              {webSources.map((s, i) => (
                <li key={i} className="font-mono text-xs">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (response.sources.length === 0) return null;

  const header =
    response.route === "WEB" ? "🌐 Web sources" : "📄 Document sources";

  return (
    <div className="mt-3">
      <p className="font-mono text-xs text-stone mb-1">{header}</p>
      <ul className="space-y-1">
        {response.sources.map((s, i) => (
          <li key={i} className="font-mono text-xs">
            {isWebSource(s) ? (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                {s.title}
              </a>
            ) : (
              <span className="text-ink">
                {s.filename}
                {s.page ? `, page ${s.page}` : ""}{" "}
                <span className="text-stone">· {s.score.toFixed(2)}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
