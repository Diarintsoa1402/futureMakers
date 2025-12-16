import API from "./api";

export const getMyResults = () => API.get("/results/me");
