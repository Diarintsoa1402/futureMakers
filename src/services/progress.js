// src/services/progress.js
import API from "./api";

export const getGlobalProgress = () => API.get("/progress/global");
export const getProgressHistory = () => API.get("/progress/history");
