import express from "express";
import { upload } from "../utils/multer";
import { uploadFile, downloadFile } from "../controllers/fileController";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadFile);
router.get("/files/:name", downloadFile);

export default router;
