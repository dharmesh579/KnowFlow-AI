import type { WebSearchResult } from "./webSearch";
import type { ExtractedPage } from "./webExtract";

const MAX_CHARS_PER_PAGE = 3000;

function cleanText(text: string): string {
  return text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[\t]{2,}/g, " ")
    .trim();
}

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).trim() + "...";
}

export function buildWebContext(
  searchResults: WebSearchResult[],
  extractedPages: ExtractedPage[] = [],
): string {
  const extractedByUrl = new Map(extractedPages.map((p) => [p.url, p.content]));

  return searchResults
    .map((result, index) => {
      const fullContent = extractedByUrl.get(result.url);
      const rawContent = fullContent ?? result.content;
      const content = truncate(cleanText(rawContent), MAX_CHARS_PER_PAGE);

      return `[${index + 1}] Source:${result.title} (${result.url}) \n${content}`;
    })
    .join("\n\n--\n\n");
}
