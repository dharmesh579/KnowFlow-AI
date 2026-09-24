import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { Document } from "@langchain/core/documents";

async function loadByMimeType(
  filePath: string,
  mimetype: string,
): Promise<Document[]> {
  switch (mimetype) {
    case "application/pdf": {
      const loader = new PDFLoader(filePath);
      return loader.load();
    }
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      const loader = new DocxLoader(filePath);
      return loader.load();
    }
    case "text/plain": {
      const loader = new TextLoader(filePath);
      return loader.load();
    }
    default:
      throw new Error(`Unsupported mimetype for extraction: ${mimetype}`);
  }
}

export async function extractDocument(
  filePath: string,
  mimeType: string,
  originalFilename: string,
): Promise<Document[]> {
  const rawDocs = await loadByMimeType(filePath, mimeType);

  const docs = rawDocs.map(
    (doc) =>
      new Document({
        pageContent: doc.pageContent,
        metadata: {
          ...doc.metadata,
          filename: originalFilename,
        },
      }),
  );

  const totalChars = docs.reduce((sum, d) => sum + d.pageContent.length, 0);

  if (totalChars === 0) {
    throw new Error(
      "No extractable text found in this document. It may be a scanned image or empty",
    );
  }
  return docs;
}
