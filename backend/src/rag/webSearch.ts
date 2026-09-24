import { TavilySearch } from "@langchain/tavily";

export interface WebSearchResult {
  title: string;
  url: string;
  content: string;
}

const MAX_RESULTS = 5;

function getTavilyTool(): TavilySearch {
  if (!process.env.TAVILY_API_KEY) {
    throw new Error("TAVILY_API_KRY is not set in .env");
  }

  return new TavilySearch({
    maxResults: MAX_RESULTS,
    tavilyApiKey: process.env.TAVILY_API_KEY,
    topic: "general",
  });
}

export async function webSearch(query: string): Promise<WebSearchResult[]> {
  const tool = getTavilyTool();
  const response = await tool.invoke({ query });

  const raw = typeof response === "string" ? JSON.parse(response) : response;
  const results = raw?.results ?? [];

  return results.map((r: { title: string; url: string; content: string }) => ({
    title: r.title,
    url: r.url,
    content: r.content,
  }));
}
