import { embedQuery } from "../rag/embedding";
import { similaritySearch } from "../rag/vectorStore";
import { buildContext } from "../rag/context";
import { buildMessages } from "../rag/prompt";
import { getChatModel } from "../rag/llm";

const TOP_K = 5;
const MIN_RELEVANCE_SCORE = 0.5;

export interface DocumentAnswer {
  answer: string;
  sources: { filename: string; page?: number; score: number }[];
}

export async function answerFromDocument(
  question: string,
  documentId?: string,
): Promise<DocumentAnswer> {
  const questionEmbedding = await embedQuery(question);
  const rawRetrieved = await similaritySearch(
    questionEmbedding,
    TOP_K,
    documentId,
  );
  const retrieved = rawRetrieved.filter((r) => r.score >= MIN_RELEVANCE_SCORE);

  if (retrieved.length === 0) {
    return {
      answer:
        "I couldn't find this information in the document. Try uploading a document first, or rephrasing your question.",
      sources: [],
    };
  }

  const context = buildContext(retrieved);
  const messages = buildMessages(context, question);

  const chatModel = getChatModel();
  const response = await chatModel.invoke(messages);
  const seen = new Set<string>();
  const sources = retrieved
    .map(({ document, score }) => ({
      filename: document.metadata.filename as string,
      page: document.metadata.loc?.pageNumber as number | undefined,
      score: Number(score.toFixed(3)),
    }))
    .filter((source) => {
      const key = `${source.filename}::${source.page ?? "n/a"}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return { answer: response.content as string, sources };
}
