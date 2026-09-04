import memberApi from "./memberApi";

// Get member payment requests
export const getMyPaymentRequests = async () => {
  const response = await memberApi.get(
    "/member/payment-requests"
  );

  return response.data;
};

// Submit payment request
export const submitPaymentRequest = async (formData) => {
  const response = await memberApi.post(
    "/member/payment-requests",
    formData
  );

  return response.data;
};

// Download member statement
export const downloadStatement = async () => {
  const response = await memberApi.get(
    "/member/statement/pdf",
    {
      responseType: "blob",
    }
  );

  return response;
};