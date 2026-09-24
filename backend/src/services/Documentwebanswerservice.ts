import { embedQuery } from "../rag/embedding";
import { similaritySearch } from "../rag/vectorStore";
import { buildContext } from "../rag/context";
import { webSearch } from "../rag/webSearch";
import { extractPages } from "../rag/webExtract";
import { buildWebContext } from "../rag/webContext";
import { buildCombinedMessages } from "../rag/prompt";
import { getChatModel } from "../rag/llm";

const TOP_K = 5;
const MIN_RELEVANCE_SCORE = 0.5;
const EXTRACT_TOP_N = 3;

export interface DocumentWebAnswer {
  answer: string;
  documentSources: { filename: string; page?: number; score: number }[];
  webSources: { title: string; url: string }[];
}

export async function answerFromDocumentAndWeb(
  question: string,
  documentId?: string,
): Promise<DocumentWebAnswer> {
  const [docResult, webResult] = await Promise.all([
    (async () => {
      const questionEmbedding = await embedQuery(question);
      const raw = await similaritySearch(questionEmbedding, TOP_K, documentId);
      return raw.filter((r) => r.score >= MIN_RELEVANCE_SCORE);
    })(),
    (async () => {
      const searchResults = await webSearch(question);
      let extractedPages: Awaited<ReturnType<typeof extractPages>> = [];
      try {
        const topUrls = searchResults.slice(0, EXTRACT_TOP_N).map((r) => r.url);
        extractedPages = await extractPages(topUrls);
      } catch (err) {
        console.warn(
          "Page extraction failed,falling back to search snippets:",
          err,
        );
      }
      return { searchResults, extractedPages };
    })(),
  ]);

  const documentContext =
    docResult.length > 0
      ? buildContext(docResult)
      : "(no relevant document content found)";
  const webContext =
    webResult.searchResults.length > 0
      ? buildWebContext(webResult.searchResults, webResult.extractedPages)
      : "(no relevant web results found)";

  const messages = buildCombinedMessages(documentContext, webContext, question);

  const chatModel = getChatModel();
  const response = await chatModel.invoke(messages);

  const seen = new Set<string>();
  const documentSources = docResult
    .map(({ document, score }) => ({
      filename: document.metadata.filename as string,
      page: document.metadata.loc?.pageNumber as number | undefined,
      score: Number(score.toFixed(3)),
    }))
    .filter((s) => {
      const key = `${s.filename}::${s.page ?? "n/a"}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  const webSources = webResult.searchResults.map((r) => ({
    title: r.title,
    url: r.url,
  }));

  return { answer: response.content as string, documentSources, webSources };
}
