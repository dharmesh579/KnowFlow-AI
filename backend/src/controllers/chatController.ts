import { Request, Response } from "express";
import { z } from "zod";
import { routeStrategy } from "../services/routerService";
import { answerDirect } from "../services/directAnswerService";
import { answerFromDocument } from "../services/DocumentanswerServices";
import { answerFromWeb } from "../services/Webanswerservice";
import { answerFromDocumentAndWeb } from "../services/Documentwebanswerservice";
import { classifyError } from "../utils/apiError";

const askQuestionSchema = z.object({
  question: z.string().trim().min(1, "question cannot be empty"),
  documentId: z.string().optional(),
});

const TOP_K = 5;

const MIN_RELEVANCE_SCORE = 0.5;

export const askQuestion = async (req: Request, res: Response) => {
  try {
    const parseResult = askQuestionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: parseResult.error.issues[0]?.message ?? "Invalid request body",
      });
    }
    const { question, documentId } = parseResult.data;

    const route = await routeStrategy(question);

    switch (route) {
      case "DIRECT": {
        const answer = await answerDirect(question);
        return res.status(200).json({ question, route, answer, sources: [] });
      }

      case "DOCUMENT": {
        const { answer, sources } = await answerFromDocument(
          question,
          documentId,
        );
        return res.status(200).json({ question, route, answer, sources });
      }

      case "WEB": {
        const { answer, sources } = await answerFromWeb(question);
        return res.status(200).json({ question, route, answer, sources });
      }

      case "DOCUMENT_WEB": {
        const { answer, documentSources, webSources } =
          await answerFromDocumentAndWeb(question, documentId);
        return res
          .status(200)
          .json({ question, route, answer, documentSources, webSources });
      }
    }
  } catch (err) {
    console.error("Chat error:", err);
    const { status, message } = classifyError(err);
    return res.status(status).json({ error: message });
  }
};
