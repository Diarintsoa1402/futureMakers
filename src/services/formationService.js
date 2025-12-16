// frontend/src/services/formationService.js
import API from "./api";

// ========== ADMIN ==========
export const createFormation = (data) => API.post("/admin/formations", data);
export const getAllFormations = () => API.get("/admin/formations");
export const updateFormation = (id, data) => API.put(`/admin/formations/${id}`, data);
export const deleteFormation = (id) => API.delete(`/admin/formations/${id}`);
export const addModule = (formationId, data) => API.post(`/admin/formations/${formationId}/modules`, data);
export const updateModule = (moduleId, data) => API.put(`/admin/modules/${moduleId}`, data);
export const deleteModule = (moduleId) => API.delete(`/admin/modules/${moduleId}`);

// ========== WOMAN ==========
export const getAvailableFormations = () => API.get("/woman/formations");
export const enrollFormation = (formationId) => API.post(`/woman/formations/${formationId}/enroll`);
export const getMyFormations = () => API.get("/woman/my-formations");
export const getFormationDetails = (enrollmentId) => API.get(`/woman/enrollments/${enrollmentId}`);
export const completeModule = (enrollmentId, moduleId, data) =>
  API.post(`/woman/enrollments/${enrollmentId}/modules/${moduleId}/complete`, data);
export const getProgress = (enrollmentId) => API.get(`/woman/enrollments/${enrollmentId}/progress`);

// Télécharger le certificat
export const downloadCertificate = async (enrollmentId) => {
  const response = await API.get(`/woman/certificates/${enrollmentId}/download`, {
    responseType: 'blob' // Important pour les fichiers binaires
  });

  // Créer un blob URL pour le téléchargement
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);

  // Créer un lien temporaire pour télécharger
  const link = document.createElement('a');
  link.href = url;
  link.download = `certificat_formation_${enrollmentId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Nettoyer l'URL du blob
  window.URL.revokeObjectURL(url);

  return url;
};

// Obtenir l'URL complète du certificat (pour affichage)
export const getCertificateUrl = (certificateUrl) => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseURL}${certificateUrl}`;
};