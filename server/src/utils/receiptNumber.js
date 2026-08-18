export const receiptNumber = (id) => {
  return `RC-${String(id).padStart(6, "0")}`;
};