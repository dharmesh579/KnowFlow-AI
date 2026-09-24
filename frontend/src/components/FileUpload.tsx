import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { uploadDocument, type UploadResponse } from "../services/api";
import Loading from "./Loading";

const ALLOWED_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE_BYTES = 20 * 1024 * 1024;

type Status = "idle" | "uploading" | "success" | "error";

export default function FileUpload() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  function validate(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Unsupported file type. Upload a PDF, DOCX, or TXT file.";
    }
    if (file.size > MAX_SIZE_BYTES) {
      return "File is too large. Maximum size is 20MB.";
    }
    return null;
  }

  async function handleFile(file: File) {
    const validationError = validate(file);
    if (validationError) {
      setStatus("error");
      setErrorMessage(validationError);
      return;
    }

    setStatus("uploading");
    setErrorMessage(null);

    try {
      const response = await uploadDocument(file);
      setResult(response);
      setStatus("success");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
      setStatus("error");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function reset() {
    setStatus("idle");
    setResult(null);
    setErrorMessage(null);
  }

  if (status === "uploading") {
    return (
      <div className="border border-stone-soft rounded p-8 text-center">
        <Loading label="Uploading and processing document…" />
      </div>
    );
  }

  if (status === "success" && result) {
    return (
      <div className="border border-accent rounded p-6 bg-accent-soft">
        <p className="font-mono text-xs text-accent mb-1">
          ✓ Uploaded · ✓ Processed
        </p>
        <p className="text-ink mb-4">{result.file.originalName}</p>
        <dl className="font-mono text-xs text-stone grid grid-cols-2 gap-y-1 mb-6 max-w-xs">
          <dt>Pages/sections</dt>
          <dd>{result.extraction.documentCount}</dd>
          <dt>Chunks</dt>
          <dd>{result.chunking.chunkCount}</dd>
          <dt>Vector dimensions</dt>
          <dd>{result.embedding.dimensions}</dd>
        </dl>
        <div className="flex gap-4">
          <button
            onClick={() =>
              navigate("/chat", {
                state: {
                  documentId: result.documentId,
                  filename: result.file.originalName,
                },
              })
            }
            className="font-mono text-sm text-paper bg-ink px-4 py-2 rounded hover:bg-accent transition-colors"
          >
            Ask questions →
          </button>
          <button
            onClick={reset}
            className="font-mono text-sm text-stone hover:text-ink"
          >
            Upload another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border border-dashed rounded p-8 text-center cursor-pointer transition-colors ${
          isDragOver
            ? "border-accent bg-accent-soft"
            : "border-stone hover:border-ink"
        }`}
      >
        <p className="text-ink mb-1">
          Drop a document here, or click to browse
        </p>
        <p className="font-mono text-xs text-stone">
          PDF, DOCX, or TXT — up to 20MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {status === "error" && errorMessage && (
        <p className="font-mono text-xs text-rust bg-rust-soft border border-rust rounded px-3 py-2 mt-3">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
