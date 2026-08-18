import memberApi from "./memberApi";

export const getPaymentHistory = async () => {
  const response = await memberApi.get("/member/payments");
  return response.data;
};

export const downloadReceipt = async (contributionId) => {
  const response = await memberApi.get(
    `/member/receipt/${contributionId}/pdf`,
    {
      responseType: "blob",
    }
  );

  return response.data;
};