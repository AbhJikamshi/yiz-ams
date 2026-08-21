import api from "./api";

const settingsService = {
  // ===============================
  // Get Settings
  // ===============================
  getSettings: async () => {
    const response = await api.get("/settings");
    return response.data;
  },

  // ===============================
  // Get Member Settings
  // ===============================
getMemberSettings: async () => {
  const response = await api.get("/settings/member");
  return response.data;
},
  // ===============================
  // Update Settings
  // ===============================
  updateSettings: async (data) => {
    const response = await api.patch(
      "/settings",
      data
    );

    return response.data;
  },

  // ===============================
  // Upload Association Logo
  // ===============================
  uploadLogo: async (file) => {
    const formData = new FormData();

    formData.append("logo", file);

    const response = await api.post(
      "/settings/logo",
      formData
    );

    return response.data;
  },
};

export default settingsService;