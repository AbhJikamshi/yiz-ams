import axios from "axios";

const memberApi = axios.create({
  baseURL: "http://localhost:5000/api",
});

memberApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("memberToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default memberApi;