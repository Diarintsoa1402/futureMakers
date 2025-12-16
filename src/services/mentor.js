import API from "./api";




// Espace mentor
export const getMyMentees = () => API.get("/mentor/mentees");
export const getMenteesProjects = () => API.get("/mentor/projects");