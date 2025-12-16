// src/services/project.js
import API from "./api";

// ==========================================
// 💼 SERVICES FEMME (Gestion multiple de projets)
// ==========================================

/**
 * Obtenir tous ses projets avec filtres et pagination
 * @param {Object} params - { status, search, page, limit }
 * @returns {Promise}
 */
export const getMyProjects = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return API.get(`/projects/my-projects${queryString ? `?${queryString}` : ''}`);
};

/**
 * Obtenir un projet spécifique par son ID
 * @param {number} projectId 
 * @returns {Promise}
 */
export const getMyProjectById = (projectId) => {
  return API.get(`/projects/my-projects/${projectId}`);
};

/**
 * Créer un nouveau projet
 * @param {Object} data - { title, description, fundingRequested }
 * @returns {Promise}
 */
export const createProject = (data) => {
  return API.post("/projects", data);
};

/**
 * Mettre à jour un projet spécifique
 * @param {number} projectId 
 * @param {Object} data - { title, description, fundingRequested }
 * @returns {Promise}
 */
export const updateProject = (projectId, data) => {
  return API.put(`/projects/${projectId}`, data);
};

/**
 * Supprimer un projet spécifique
 * @param {number} projectId 
 * @returns {Promise}
 */
export const deleteProject = (projectId) => {
  return API.delete(`/projects/${projectId}`);
};

/**
 * Obtenir ses statistiques personnelles
 * @returns {Promise}
 */
export const getMyStats = () => {
  return API.get("/projects/my-stats/overview");
};

/**
 * Obtenir la progression d'un projet spécifique (CORRIGÉ pour cohérence)
 * @param {number} projectId 
 * @returns {Promise}
 */
export const getProjectProgress = (projectId) => {
  return API.get(`/projects/my-projects/${projectId}/progress`);
};

// ==========================================
// 🧑‍💼 SERVICES ADMIN
// ==========================================

/**
 * Obtenir tous les projets avec filtres et pagination
 * @param {Object} params - { status, search, userId, page, limit }
 * @returns {Promise}
 */
export const getAllProjects = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return API.get(`/projects${queryString ? `?${queryString}` : ''}`);
};

/**
 * Obtenir les statistiques globales des projets
 * @returns {Promise}
 */
export const getProjectStats = () => {
  return API.get("/projects/stats/overview");
};

/**
 * Mettre à jour le statut d'un projet (admin)
 * @param {number} projectId 
 * @param {Object} data - { status, progress, comments }
 * @returns {Promise}
 */
export const updateProjectStatus = (projectId, data) => {
  return API.patch(`/projects/${projectId}/status`, data);
};

// ==========================================
// 🛠️ HELPERS
// ==========================================

/**
 * Formater le montant en Ariary
 * @param {number} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Obtenir la configuration associée à un statut
 * @param {string} status 
 * @returns {Object}
 */
export const getStatusConfig = (status) => {
  const configs = {
    "en cours": {
      color: "blue",
      bgClass: "bg-blue-100",
      textClass: "text-blue-800",
      borderClass: "border-blue-500",
      gradient: "from-blue-500 to-cyan-500",
      label: "En cours",
      icon: "🔄"
    },
    "validé": {
      color: "green",
      bgClass: "bg-green-100",
      textClass: "text-green-800",
      borderClass: "border-green-500",
      gradient: "from-emerald-500 to-teal-500",
      label: "Validé",
      icon: "✨"
    },
    "refusé": {
      color: "red",
      bgClass: "bg-red-100",
      textClass: "text-red-800",
      borderClass: "border-red-500",
      gradient: "from-rose-500 to-pink-500",
      label: "Refusé",
      icon: "⚠️"
    },
    "terminé": {
      color: "gray",
      bgClass: "bg-gray-100",
      textClass: "text-gray-800",
      borderClass: "border-gray-500",
      gradient: "from-slate-500 to-gray-500",
      label: "Terminé",
      icon: "🏁"
    }
  };

  return configs[status] || configs["en cours"];
};

/**
 * Valider les données d'un projet côté client
 * @param {Object} data 
 * @returns {Object} - { isValid, errors }
 */
export const validateProjectData = (data) => {
  const errors = {};

  // Validation du titre
  if (!data.title || !data.title.trim()) {
    errors.title = "Le titre est requis";
  } else if (data.title.length < 5) {
    errors.title = "Le titre doit contenir au moins 5 caractères";
  } else if (data.title.length > 100) {
    errors.title = "Le titre ne peut pas dépasser 100 caractères";
  }

  // Validation de la description
  if (!data.description || !data.description.trim()) {
    errors.description = "La description est requise";
  } else if (data.description.length < 20) {
    errors.description = "La description doit contenir au moins 20 caractères";
  } else if (data.description.length > 2000) {
    errors.description = "La description ne peut pas dépasser 2000 caractères";
  }

  // Validation du montant
  const funding = parseFloat(data.fundingRequested);
  if (!data.fundingRequested || isNaN(funding)) {
    errors.fundingRequested = "Le montant demandé est requis";
  } else if (funding < 10000) {
    errors.fundingRequested = "Le montant minimum est de 10 000 Ar";
  } else if (funding > 100000000) {
    errors.fundingRequested = "Le montant maximum est de 100 000 000 Ar";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Calculer le pourcentage de complétion moyen
 * @param {Array} projects 
 * @returns {number}
 */
export const calculateAverageProgress = (projects) => {
  if (!projects || projects.length === 0) return 0;
  const sum = projects.reduce((acc, project) => acc + (project.progress || 0), 0);
  return Math.round(sum / projects.length);
};

/**
 * Grouper les projets par statut
 * @param {Array} projects 
 * @returns {Object}
 */
export const groupProjectsByStatus = (projects) => {
  return projects.reduce((acc, project) => {
    const status = project.status || 'en cours';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(project);
    return acc;
  }, {});
};

/**
 * Calculer le montant total demandé
 * @param {Array} projects
 * @returns {number}
 */
export const calculateTotalFunding = (projects) => {
  if (!projects || projects.length === 0) return 0;
  return projects.reduce((acc, project) => acc + (project.fundingRequested || 0), 0);
};

/**
 * Créer une mise à jour de progression pour un projet (CORRIGÉ pour cohérence)
 * @param {number} projectId
 * @param {Object} data - { progress, updateNote }
 * @returns {Promise}
 */
export const createProjectUpdate = (projectId, data) => {
  return API.post(`/projects/my-projects/${projectId}/updates`, data);
};

/**
 * Obtenir les mises à jour d'un projet (CORRIGÉ pour cohérence)
 * @param {number} projectId
 * @param {Object} params - { page, limit }
 * @returns {Promise}
 */
export const getProjectUpdates = (projectId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return API.get(`/projects/my-projects/${projectId}/updates${queryString ? `?${queryString}` : ''}`);
};

/**
 * Supprimer une mise à jour
 * @param {number} updateId
 * @returns {Promise}
 */
export const deleteProjectUpdate = (updateId) => {
  return API.delete(`/projects/updates/${updateId}`);
};

/**
 * Filtrer les projets par recherche
 * @param {Array} projects 
 * @param {string} searchTerm 
 * @returns {Array}
 */
export const filterProjectsBySearch = (projects, searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) return projects;
  
  const term = searchTerm.toLowerCase();
  return projects.filter(project => 
    project.title.toLowerCase().includes(term) ||
    project.description.toLowerCase().includes(term)
  );
};

/**
 * Trier les projets
 * @param {Array} projects 
 * @param {string} sortBy - 'date', 'title', 'progress', 'funding'
 * @param {string} order - 'asc' ou 'desc'
 * @returns {Array}
 */
export const sortProjects = (projects, sortBy = 'date', order = 'desc') => {
  const sorted = [...projects];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'progress':
        comparison = a.progress - b.progress;
        break;
      case 'funding':
        comparison = a.fundingRequested - b.fundingRequested;
        break;
      default:
        comparison = 0;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
};