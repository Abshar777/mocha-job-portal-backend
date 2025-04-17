import express from "express";
import UtilController from "../controller/Implements/util.controller";
import authMiddleware, { refreshTokenMidllWare } from "../middleware/authMiddileware";
import { validate } from "../middleware/validateMiddleware";
import multer from "multer";
import { uploadSchema } from "../validator/util.validator";

const router = express.Router();
const controller = new UtilController();
const upload = multer();

/**
 * @route   POST /api/util/upload
 * @desc    Upload File
 * @access  Private
 */
router.post("/upload", authMiddleware, upload.single("file"), controller.upload);

export default router;
