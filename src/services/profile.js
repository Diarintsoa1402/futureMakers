
import API from "./api";

// 🔹 Récupérer le profil de l'utilisateur connecté
export const getProfile = () => API.get("/profile");

// 🔹 Mettre à jour le profil
export const updateProfile = (data) => API.put("/profile", data);

// 🔹 Supprimer le compte utilisateur
export const deleteProfile = () => API.delete("/profile");
