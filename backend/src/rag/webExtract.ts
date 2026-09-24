import { TavilyExtract } from "@langchain/tavily";

export interface ExtractedPage {
  url: string;
  content: string;
}

const MAX_PAGES_TO_EXTRACT = 3;

function getExtractTool(): TavilyExtract {
  if (!process.env.TAVILY_API_KEY) {
    throw new Error("TAVILY_API_KEY is not set in .env");
  }

  return new TavilyExtract({
    tavilyApiKey: process.env.TAVILY_API_KEY,
    extractDepth: "basic",
  });
}

export async function extractPages(urls: string[]): Promise<ExtractedPage[]> {
  const targetedUrls = urls.slice(0, MAX_PAGES_TO_EXTRACT);

  if (targetedUrls.length === 0) {
    return [];
  }

  const tool = getExtractTool();

  const response = await tool.invoke({ urls: targetedUrls });

  const raw = typeof response === "string" ? JSON.parse(response) : response;

  const results = raw?.results ?? [];

  return results
    .filter((r: { url?: string; raw_content: string }) =>
      Boolean(r.raw_content),
    )
    .map((r: { url: string; raw_content: string }) => ({
      url: r.url,
      content: r.raw_content,
    }));
}
