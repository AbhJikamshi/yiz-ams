import express from "express";
import uploadMiddleware from "../middlewares/uploadMiddleware.js";
import memberAuthMiddleware from "../middlewares/memberAuthMiddleware.js";
import { uploadPaymentProof } from "../controllers/uploadController.js";

const router = express.Router();

// TEST ROUTE
router.get("/upload-test", (req, res) => {
  res.json({
    success: true,
    message: "Upload routes are working."
  });
});

router.post(
  "/member/payment-requests/:id/upload-proof",
  memberAuthMiddleware,
  uploadMiddleware.single("proof"),
  uploadPaymentProof
);

export default router;