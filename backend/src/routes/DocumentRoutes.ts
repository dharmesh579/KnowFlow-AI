import { Router } from "express";
import { upload } from "../config/multer";
import { uploadDocument } from "../controllers/Documentcontroller";

const router = Router();

router.post("/upload", upload.single("document"), uploadDocument);

export default router;
