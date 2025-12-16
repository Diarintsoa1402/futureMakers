import API from "./api";

// 👩 Femme
export const requestMentor = (data) => API.post("/mentorships", data);
export const getAvailableMentors = () => API.get("/mentorships/mentors");

// 🧑‍🏫 Mentor
export const getAllMentorshipRequests = () => API.get("/mentorships");
export const reviewMentorship = (id, data) => API.put(`/mentorships/${id}`, data);