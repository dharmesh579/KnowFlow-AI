import {
  SystemMessage,
  HumanMessage,
  BaseMessage,
} from "@langchain/core/messages";

const SYSTEM_PROMPT = `You are a helpful assistant that answers questions using ONLY the information provided in the context below.
 
Rules:
- Answer strictly using the given context. Do not use outside knowledge, even if you know the answer.
- If the answer is not present in the context, say clearly: "I couldn't find this information in the document." Do not guess or make anything up.
- Be concise and directly answer what was asked.
- If it's helpful, you may refer to sources by their [n] number from the context.`;

export function buildMessages(
  context: string,
  question: string,
): BaseMessage[] {
  return [
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(`Context:\n${context}\n\nQuestion:\n${question}`),
  ];
}

const DIRECT_SYSTEM_PROMPT = `You are a helpful, knowledgeable assistant. Answer the user's question clearly and concisely using your own knowledge.`;

export function buildDirectMessages(question: string): BaseMessage[] {
  return [new SystemMessage(DIRECT_SYSTEM_PROMPT), new HumanMessage(question)];
}

const WEB_SYSTEM_PROMPT = `You are a helpful assistant that answers questions using ONLY the information provided in the web search results below.

Rules:
- Answer strictly using the given web search results. Do not use outside knowledge, even if you know the answer.
- If the answer is not present in the results, say clearly: "I couldn't find current information on this." Do not guess or make anything up.
- Be concise and directly answer what was asked.
- If it's helpful, you may refer to sources by their [n] number from the results.`;

export function buildWebMessages(
  context: string,
  question: string,
): BaseMessage[] {
  return [
    new SystemMessage(WEB_SYSTEM_PROMPT),
    new HumanMessage(
      `Web search results:\n${context}\n\nQuestion:\n${question}`,
    ),
  ];
}

const COMBINE_SYSTEM_PROMPT = `You are a helpful assistant that answers questions by combining two sources of information: content from a document the user uploaded, and current information from the web.

Rules:
- Use BOTH sources together to answer, drawing a clear connection between what the document says and what's currently true.
- Only use the information given in the two context sections below. Do not use outside knowledge beyond what's provided.
- If one of the two sources has no relevant information, say so and answer using only the source that does.
- If neither source has relevant information, say clearly that the information was not found.
- Be concise and directly answer what was asked.`;

export function buildCombinedMessages(
  documentContext: string,
  webContext: string,
  question: string,
): BaseMessage[] {
  const combinedPrompt = `Document context:\n${documentContext}\n\nWeb context:\n${webContext}\n\nQuestion:\n${question}`;
  return [
    new SystemMessage(COMBINE_SYSTEM_PROMPT),
    new HumanMessage(combinedPrompt),
  ];
}