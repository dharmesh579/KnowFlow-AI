import { Request, Response } from "express";
import { extractDocument } from "../rag/loader";
import { chunkDocuments } from "../rag/chunker";
import { embedChunks } from "../rag/embedding";
import { storeChunks } from "../rag/vectorStore";
import { DocumentModel } from "../models/document";
import { classifyError } from "../utils/apiError";

export const uploadDocument = async (req: Request, res: Response) => {
  let documentRecord;
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file ulpoaded .Attach a file under the field name 'document",
      });
    }
    const { originalname, filename, mimetype, size, path: filePath } = req.file;

    documentRecord = await DocumentModel.create({
      filename: originalname,
      mimeType: mimetype,
      sizeBytes: size,
      status: "processing",
    });
    const documentId = documentRecord._id.toString();

    const docs = await extractDocument(filePath, mimetype, originalname);
    const chunks = await chunkDocuments(docs);
    chunks.forEach((chunk) => {
      chunk.metadata.documentId = documentId;
    });
    const vectors = await embedChunks(chunks);
    await storeChunks(chunks, vectors);

    documentRecord.status = "ready";
    documentRecord.chunkCount = chunks.length;
    await documentRecord.save();

    return res.status(201).json({
      message: "File uploaded successfully and stored successfully",
      documentId,
      file: {
        originalname: originalname,
        storedAs: filename,
        mimeType: mimetype,
        sizeBytes: size,
        path: filePath,
      },
      extraction: {
        documentCount: docs.length,
      },
      chunking: {
        chunkCount: chunks.length,
        sampleCount: {
          content: chunks[0]?.pageContent,
          metadata: chunks[0]?.metadata,
        },
      },
      embedding: {
        vectorCount: vectors.length,
        dimensions: vectors[0]?.length ?? 0,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);

    const { status, message } = classifyError(err);
    return res.status(status).json({ error: message });
  }
};
