import API from "./api";

// Mentor
export const createSession = (data) => API.post("/mentorship-sessions", data);
export const completeSession = (id, data) => API.put(`/mentorship-sessions/${id}`, data);
export const cancelSession = (id, data) => API.put(`/mentorship-sessions/${id}/cancel`, data);
export const rescheduleSession = (id, data) => API.put(`/mentorship-sessions/${id}/reschedule`, data);
export const getMentorSessions = () => API.get("/mentorship-sessions/mentor");

// Femme
export const getMySessions = () => API.get("/mentorship-sessions/me");

// Helper: get all women (for dropdown)
export const getAllWomen = () => API.get("/mentorship-sessions/women");
