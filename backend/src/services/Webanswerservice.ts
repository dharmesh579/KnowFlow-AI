import { webSearch } from "../rag/webSearch";
import { extractPages } from "../rag/webExtract";
import { buildWebContext } from "../rag/webContext";
import { buildWebMessages } from "../rag/prompt";
import { getChatModel } from "../rag/llm";

export interface WebAnswer {
  answer: string;
  sources: { title: string; url: string }[];
}

const EXTRACT_TOP_N = 3;

export async function answerFromWeb(question: string): Promise<WebAnswer> {
  const searchResults = await webSearch(question);

  if (searchResults.length === 0) {
    return {
      answer: "I couldn't find any current information about this online.",
      sources: [],
    };
  }

  let extractedPages: Awaited<ReturnType<typeof extractPages>> = [];

  try {
    const topUrls = searchResults.slice(0, EXTRACT_TOP_N).map((r) => r.url);
    extractedPages = await extractPages(topUrls);
  } catch (err) {
    console.warn(
      "Page extraction failed, falling back to search snippets:",
      err,
    );
  }

  const context = buildWebContext(searchResults, extractedPages);

  const messages = buildWebMessages(context, question);

  const chatModel = getChatModel();
  const response = await chatModel.invoke(messages);

  const sources = searchResults.map((r) => ({ title: r.title, url: r.url }));

  return { answer: response.content as string, sources };
}
