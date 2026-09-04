import express from "express";
import * as paymentRequestController from "../controllers/paymentRequestController.js";

import memberAuthMiddleware from "../middlewares/memberAuthMiddleware.js";
import authMiddleware from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// Member submits payment request
router.post(
  "/member/payment-requests",
  memberAuthMiddleware,
  paymentRequestController.create
);

// Member views own requests
router.get(
  "/member/payment-requests",
  memberAuthMiddleware,
  paymentRequestController.myRequests
);

// Admin/Treasurer views pending requests
router.get(
  "/admin/payment-requests/pending",
  authMiddleware,
  paymentRequestController.pending
);


// Treasurer/Admin approves payment
router.patch(
  "/admin/payment-requests/:id/approve",
  authMiddleware,
  paymentRequestController.approve
);

// Treasurer/Admin rejects payment
router.patch(
  "/admin/payment-requests/:id/reject",
  authMiddleware,
  paymentRequestController.reject
);

export default router;