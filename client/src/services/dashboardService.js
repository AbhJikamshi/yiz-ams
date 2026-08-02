import api from "../api/api";

export const getDashboardSummary = async () => {
  const { data } = await api.get("/dashboard");

  return data.data;
};