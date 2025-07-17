import multer from "multer";
import path from "path";
import express from "express";

const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const fileUrl = `http://localhost:4000/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});
