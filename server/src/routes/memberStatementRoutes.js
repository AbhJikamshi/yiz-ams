import express from "express";
import * as memberStatementController from "../controllers/memberStatementController.js";
import memberAuthMiddleware from "../middlewares/memberAuthMiddleware.js";

const router = express.Router();

// Download Member Statement PDF
router.get(
  "/statement/pdf",
  memberAuthMiddleware,
  memberStatementController.downloadStatement
);

export default router;