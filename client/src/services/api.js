import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",
});

api.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    const isMemberRequest =
      url.startsWith("/member/") ||
      url.startsWith("/settings/member");

    let token = null;

    if (isMemberRequest) {
      // MEMBER requests must use the member token first.
      token =
        localStorage.getItem("memberToken") ||
        sessionStorage.getItem("memberToken");
    } else {
      // ADMIN/general requests use the admin token first.
      token =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;