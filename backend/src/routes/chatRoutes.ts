import { Router } from "express";
import { askQuestion } from "../controllers/chatController";

const router = Router();

router.post("/", askQuestion);

export default router;
