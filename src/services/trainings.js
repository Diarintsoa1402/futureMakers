import API from "./api";
export const getTrainings = () => API.get("/trainings");
export const createTraining = (data) => API.post("/trainings", data);
export const enrollTraining = (id) => API.post(`/trainings/${id}/enroll`);
export const getMyEnrollments = () => API.get("/trainings/mine");
