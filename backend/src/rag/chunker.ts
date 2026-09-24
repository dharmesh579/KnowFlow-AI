import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export async function chunkDocuments(docs: Document[]): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const chunks = await splitter.splitDocuments(docs);

  return chunks.map(
    (chunk, index) =>
      new Document({
        pageContent: chunk.pageContent,
        metadata: {
          ...chunk.metadata,
          chunkNumber: index,
        },
      }),
  );
}
