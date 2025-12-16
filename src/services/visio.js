import API from "./api";

// Mentor: planifier une session
export const planVisio = (data) => API.post("/visio", data);

// Mentor: annuler une session
export const cancelVisio = (id, data) => API.put(`/visio/${id}/cancel`, data);

// Mentor: replanifier une session
export const rescheduleVisio = (id, data) => API.put(`/visio/${id}/reschedule`, data);

// Commun: rejoindre une session (obtenir le lien)
export const joinVisio = (id) => API.get(`/visio/${id}/join`);

// Commun: obtenir toutes mes sessions (mentor ou femme)
export const getMyVisios = () => API.get("/visio");