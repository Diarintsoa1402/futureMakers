// services/leaderboard.js
import API from "./api";

export const getRanking = (params = {}) => {
  return API.get("/ranking", { params });
};

export const getMyRank = () => {
  return API.get("/ranking/me");
};