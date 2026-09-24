export type EmbeddingProvider = "openai" | "google";

export function resolveProvider(): EmbeddingProvider {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GOOGLE_API_KEY) return "google";
  throw new Error(
    "No embedding provider configured .Set OPENAI_API_KEY or GOOGLE_API_KEY in .env",
  );
}
