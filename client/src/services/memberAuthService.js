import api from "./api";

// Register a new member account
export const registerMember = async (data) => {
  const response = await api.post("/member-auth/register", data);
  return response.data;
};

// Login member
export const loginMember = async (email, password) => {
  const response = await api.post("/member-auth/login", {
    email,
    password,
  });

  return response.data;
};

// Request password reset
export const requestPasswordReset = async (email) => {
  const response = await api.post("/member-auth/forgot-password", {
    email,
  });

  return response.data;
};

// Verify password reset token
export const verifyPasswordResetToken = async (token) => {
  const response = await api.get(
    `/member-auth/verify-reset-token?token=${encodeURIComponent(token)}`
  );

  return response.data;
};

// Reset member password
export const resetMemberPassword = async (token, newPassword) => {
  const response = await api.post("/member-auth/reset-password", {
    token,
    newPassword,
  });

  return response.data;
};