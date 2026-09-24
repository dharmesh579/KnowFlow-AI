import type { RetrievedChunk } from "./vectorStore";

export function buildContext(chunks: RetrievedChunk[]): string {
  return chunks
    .map(({ document }, index) => {
      const filename = document.metadata.filename ?? "unknown source";
      const page = document.metadata.loc?.pageNumber;
      const label = page ? `${filename}, page ${page}` : filename;

      return `[${index + 1}] Source: ${label}\n${document.pageContent}`;
    })
    .join("\n\n---\n\n");
}
