"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = require("../utils/multer");
const fileController_1 = require("../controllers/fileController");
const router = express_1.default.Router();
router.post("/upload", multer_1.upload.single("file"), fileController_1.uploadFile);
router.get("/files/:name", fileController_1.downloadFile);
exports.default = router;
