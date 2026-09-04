import * as paymentRequestService from "../services/paymentRequestService.js";

// Member submits payment request
export const create = async (req, res, next) => {
  try {
    const paymentRequest =
      await paymentRequestService.createPaymentRequest(
        req.member.id,
        req.body
      );

    res.status(201).json({
      success: true,
      message: "Payment request submitted successfully.",
      data: paymentRequest,
    });
  } catch (error) {
    next(error);
  }
};

// Member views own payment requests
export const myRequests = async (req, res, next) => {
  try {
    const result =
      await paymentRequestService.getMemberPaymentPageData(
        req.member.id,
        req.member.organizationId
      );

    res.json({
      success: true,
      data: result.requests,
      summary: result.summary,
    });
  } catch (error) {
    next(error);
  }
};

// Treasurer/Admin views all pending requests
export const pending = async (req, res, next) => {
  try {
    const requests =
      await paymentRequestService.getPendingPaymentRequests();

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};
// Approve payment request
export const approve = async (req, res, next) => {
  console.log("Approve endpoint reached");
  console.log("Request ID:", req.params.id);
  console.log("Admin ID:", req.admin.id);

  try {
    const result =
      await paymentRequestService.approvePaymentRequest(
        req.params.id,
        req.admin.id
      );

    res.json({
      success: true,
      message: "Payment approved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Reject payment request
export const reject = async (req, res, next) => {
  try {
    const result =
      await paymentRequestService.rejectPaymentRequest(
        req.params.id,
        req.admin.id,
        req.body.remarks
      );

    res.json({
      success: true,
      message: "Payment rejected.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};