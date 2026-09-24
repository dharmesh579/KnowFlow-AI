import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { resolveProvider } from "../config/aiProvider";

export function getChatModel(): BaseChatModel {
  const provider = resolveProvider();

  switch (provider) {
    case "openai":
      return new ChatOpenAI({
        model: "gpt-4.1-mini",
        temperature: 0.2,
      });
    case "google":
      return new ChatGoogleGenerativeAI({
        model: "gemini-3.5-flash-lite",
        temperature: 0.2,
      });
  }
}
