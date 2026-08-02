import api from "../api/api";

export const getMembers = async () => {
  const { data } = await api.get("/members");
  return data.data;
};

export const createMember = async (member) => {
  const { data } = await api.post("/members", member);
  return data.data;
};

export const updateMember = async (id, member) => {
  const { data } = await api.put(`/members/${id}`, member);
  return data.data;
};

export const deleteMember = async (id) => {
  await api.delete(`/members/${id}`);
};