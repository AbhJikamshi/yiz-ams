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
