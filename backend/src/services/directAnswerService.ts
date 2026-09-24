import { getChatModel } from "../rag/llm";
import { buildDirectMessages } from "../rag/prompt";

export async function answerDirect(question: string): Promise<string> {
  const chatModel = getChatModel();
  const messages = buildDirectMessages(question);
  const response = await chatModel.invoke(messages);
  return response.content as string;
}
