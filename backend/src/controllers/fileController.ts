import { Request, Response } from "express";
import path from "path";
import fs from "fs";

export const uploadFile = (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  res.status(200).json({
    message: "File uploaded successfully",
    filename: req.file.filename,
    url: `/files/${req.file.filename}`,
  });
};

export const downloadFile = (req: Request, res: Response) => {
  const fileName = req.params.name;
  const filePath = path.join(__dirname, "../../../uploads", fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.download(filePath);
};
