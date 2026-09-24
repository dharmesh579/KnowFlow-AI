export interface ApiError {
  status: number;
  message: string;
}

export function classifyError(err: unknown): ApiError {
  const anyErr = err as {
    status?: number;
    statusCode?: number;
    response?: { status?: number };
    cause?: { status?: number };
    message?: string;
  };

  const status =
    anyErr?.status ??
    anyErr?.statusCode ??
    anyErr?.response?.status ??
    anyErr?.cause?.status;

  const message = String(anyErr?.message ?? "").toLowerCase();

  if (
    status === 401 ||
    status === 403 ||
    message.includes("api key") ||
    message.includes("authentication")
  ) {
    return {
      status: 401,
      message:
        "Invalid or missing API key. Check OPENAI_API_KEY, GOOGLE_API_KEY, and TAVILY_API_KEY in your .env file.",
    };
  }

  if (
    status === 429 ||
    message.includes("rate limit") ||
    message.includes("quota") ||
    message.includes("resource_exhausted")
  ) {
    return {
      status: 429,
      message:
        "Rate limit or quota exceeded.Please wait a moment and try again",
    };
  }

  if (status !== undefined && status >= 500) {
    return {
      status: 502,
      message:
        "The AI provider si temporarily unavailable.please try again shortly",
    };
  }

  return {
    status: 500,
    message: anyErr?.message || "Something went wrong. Please try again.",
  };
}
