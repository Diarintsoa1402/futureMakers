// src/services/formation.js
import API from "./api";

export const getAllFormations = () => API.get("/formations");
export const startFormation = (formationId) => API.post("/formations/start", { formationId });
export const getMyFormations = () => API.get("/formations/my-formations");
export const getFormationDetails = (id) => API.get(`/formations/${id}`);
export const completeModule = (data) => API.post("/formations/complete-module", data);
export const downloadCertificate = (formationId) => API.get(`/formations/certificate/${formationId}`);
