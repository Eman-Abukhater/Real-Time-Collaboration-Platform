"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFile = exports.uploadFile = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadFile = (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: "No file uploaded" });
    res.status(200).json({
        message: "File uploaded successfully",
        filename: req.file.filename,
        url: `/files/${req.file.filename}`,
    });
};
exports.uploadFile = uploadFile;
const downloadFile = (req, res) => {
    const fileName = req.params.name;
    const filePath = path_1.default.join(__dirname, "../../../uploads", fileName);
    if (!fs_1.default.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
    }
    res.download(filePath);
};
exports.downloadFile = downloadFile;
