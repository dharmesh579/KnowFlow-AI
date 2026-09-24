export interface UploadResponse {
  message: string;
  documentId: string;
  file: {
    originalName: string;
    storedAs: string;
    mimeType: string;
    sizeBytes: string;
  };
  extraction: { documentCount: number };
  chunking: { chunkCount: number };
  embedding: { vectorCount: number; dimensions: number };
}

export type Route = "DOCUMENT" | "DIRECT" | "WEB" | "DOCUMENT_WEB";

export interface DocumentSource {
  filename: string;
  page?: number;
  score: number;
}

export interface WebSource {
  title: string;
  url: string;
}

export type ChatResponse =
  | {
      question: string;
      route: "DOCUMENT" | "DIRECT" | "WEB";
      answer: string;
      sources: (DocumentSource | WebSource)[];
    }
  | {
      question: string;
      route: "DOCUMENT_WEB";
      answer: string;
      documentSources: DocumentSource[];
      webSources: WebSource[];
    };

interface ApiErrorBody {
  error: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Server returned an unexpected response (status ${res.status}). Check that the backend is running.`,
    );
  }

  const body = await res.json();
  if (!res.ok) {
    throw new Error(
      (body as ApiErrorBody).error || `Request failed (${res.status})`,
    );
  }
  return body as T;
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("document", file);

  const res = await fetch("/api/documents/upload", {
    method: "POST",
    body: formData,
  });

  return handleResponse<UploadResponse>(res);
}

export async function askQuestion(
  question: string,
  documentId?: string,
): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, documentId }),
  });

  return handleResponse<ChatResponse>(res);
}
