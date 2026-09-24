import { z } from "zod";
import { getChatModel } from "../rag/llm";

export const RouteEnum = z.enum(["DOCUMENT", "DIRECT", "WEB", "DOCUMENT_WEB"]);

export type Route = z.infer<typeof RouteEnum>;

const routeSchema = z.object({
  route: RouteEnum,
});

const ROUTER_SYSTEM_PROMPT = `You are a routing classifier for a Q&A assistant. The assistant can answer in one of four ways. Classify the user's question into exactly one route:
 
- DOCUMENT: the question asks about the content of a document the user uploaded (e.g. "what skills are listed", "summarize this resume", "what projects are mentioned").
- DIRECT: a general-knowledge question answerable from training knowledge alone, with no document and no need for current/real-time info (e.g. "explain recursion", "what is a closure in JavaScript").
- WEB: the question needs current, real-time, or recent information — latest versions, news, prices, "today", "current", anything time-sensitive.
- DOCUMENT_WEB: the question explicitly compares or combines the uploaded document's content with current/external information (e.g. "compare my resume skills to current job requirements").
 
Respond with only the route classification.`;

export async function routeStrategy(question: string): Promise<Route> {
  const model = getChatModel();
  const structuredModel = model.withStructuredOutput(routeSchema);
  const result = await structuredModel.invoke([
    {
      role: "system",
      content: ROUTER_SYSTEM_PROMPT,
    },
    { role: "human", content: question },
  ]);

  return result.route;
}
