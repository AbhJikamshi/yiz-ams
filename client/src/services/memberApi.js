import axios from "axios";

const memberApi = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",
});

memberApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("memberToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getMemberDashboard = async () => {
  const response = await memberApi.get("/member/dashboard");

  return response.data;
};

export default memberApi;