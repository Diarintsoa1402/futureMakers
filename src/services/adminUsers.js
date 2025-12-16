import API from "./api";

export const adminCreateUser = (data) => API.post("/admin/users", data);
export const adminDeleteUser = (id) => API.delete(`/admin/users/${id}`);
export const adminGetUsers = () => API.get("/admin/users");
export const adminUpdateUserPassword = (id, password) => API.patch(`/admin/users/${id}/password`, { password });
