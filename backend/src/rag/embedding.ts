import { OpenAIEmbeddings } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import type { EmbeddingsInterface } from "@langchain/core/embeddings";
import type { Document } from "@langchain/core/documents";
import { resolveProvider } from "../config/aiProvider";


export function getEmbeddingsModel(): EmbeddingsInterface {
  const provider = resolveProvider();
  switch (provider) {
    case "openai":
      return new OpenAIEmbeddings({
        model: "text-embedding-3-small",
      });
    case "google":
      return new GoogleGenerativeAIEmbeddings({
        model: "gemini-embedding-001",
      });
  }
}

export async function embedChunks(chunks: Document[]): Promise<number[][]> {
  const embeddings = getEmbeddingsModel();
  const text = chunks.map((chunk) => chunk?.pageContent);
  return embeddings.embedDocuments(text);
}

export async function embedQuery(text: string): Promise<number[]> {
  const embeddings = getEmbeddingsModel();
  return embeddings.embedQuery(text);
}
