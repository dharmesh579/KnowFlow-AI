import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore, QdrantFilter } from "@langchain/qdrant";
import type { Document } from "@langchain/core/documents";
import { getEmbeddingsModel } from "./embedding";

let cachedClient: QdrantClient | null = null;

function getClient(): QdrantClient {
  if (!cachedClient) {
    cachedClient = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
  }
  return cachedClient;
}

function getCollectionName(): string {
  return process.env.QDRANT_COLLECTION || "documents";
}

let documentIdIndexEnsured = false;

async function ensureDocumentIdIndex(): Promise<void> {
  if (documentIdIndexEnsured) return;

  try {
    await getClient().createPayloadIndex(getCollectionName(), {
      field_name: "metadata.documentId",
      field_schema: "keyword",
    });
    documentIdIndexEnsured = true;
  } catch (err) {
    console.warn("Could not ensure metadata.documentId payload index:", err);
  }
}

async function ensureCollection(dimensions: number): Promise<void> {
  const client = getClient();
  const collectionName = getCollectionName();
  const { collections } = await client.getCollections();
  const exists = collections.some((c) => c.name === collectionName);

  if (!exists) {
    await client.createCollection(collectionName, {
      vectors: { size: dimensions, distance: "Cosine" },
    });
    console.log(
      `Created Qdrant collection "${collectionName}" (${dimensions} dims)`,
    );
  }

  await ensureDocumentIdIndex();
}

function getVectorStore(): QdrantVectorStore {
  const embeddings = getEmbeddingsModel();
  return new QdrantVectorStore(embeddings, {
    client: getClient(),
    collectionName: getCollectionName(),
  });
}

export async function storeChunks(
  chunks: Document[],
  vectors: number[][],
): Promise<void> {
  if (chunks.length !== vectors.length) {
    throw new Error(
      "chunks and vectors must be the same length and in the same order",
    );
  }

  const dimensions = vectors[0]?.length;
  if (!dimensions) {
    throw new Error("No vectors to store");
  }

  await ensureCollection(dimensions);
  await getVectorStore().addVectors(vectors, chunks);
}

export interface RetrievedChunk {
  document: Document;
  score: number;
}

export async function similaritySearch(
  queryVector: number[],
  k: number = 5,
  documentId?: string,
): Promise<RetrievedChunk[]> {
  await ensureDocumentIdIndex();

  const filter: QdrantFilter | undefined = documentId
    ? {
        must: [
          {
            key: "metadata.documentId",
            match: { value: documentId },
          },
        ],
      }
    : undefined;

  const results = await getVectorStore().similaritySearchVectorWithScore(
    queryVector,
    k,
    filter,
  );

  return results.map(([document, score]) => ({ document, score }));
}
