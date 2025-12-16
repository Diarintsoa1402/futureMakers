// services/entreprise.js
import API from "./api";

/**
 * Récupérer la mini-entreprise de l'utilisateur
 * @returns {Promise} Promesse avec les données de l'entreprise
 */
export const getEnterprise = async () => {
  try {
    const response = await API.get("/mini-enterprise");
    return response.data;
  } catch (error) {
    console.error("Erreur getEnterprise:", error);
    throw error;
  }
};

/**
 * Créer ou mettre à jour la mini-entreprise
 * @param {Object} data - Données de l'entreprise
 * @returns {Promise} Promesse avec les données sauvegardées
 */
export const updateEnterprise = async (data) => {
  try {
    // Validation côté client avant l'envoi
    if (data.products) {
      data.products = data.products.map(product => ({
        id: product.id,
        name: product.name?.trim() || "",
        price: parseFloat(product.price) || 0,
        stock: parseInt(product.stock) || 0
      }));
    }

    if (data.finances) {
      data.finances = {
        capital: parseFloat(data.finances.capital) || 0,
        revenue: parseFloat(data.finances.revenue) || 0,
        expenses: parseFloat(data.finances.expenses) || 0
      };
    }

    const response = await API.put("/mini-enterprise", data);
    return response.data;
  } catch (error) {
    console.error("Erreur updateEnterprise:", error);
    throw error;
  }
};

/**
 * Créer une nouvelle mini-entreprise avec des valeurs par défaut
 * @returns {Promise} Promesse avec les données de la nouvelle entreprise
 */
export const createEnterprise = async () => {
  const defaultData = {
    products: [],
    finances: { 
      capital: 0, 
      revenue: 0, 
      expenses: 0 
    }
  };
  
  return updateEnterprise(defaultData);
};

/**
 * Supprimer la mini-entreprise
 * @returns {Promise} Promesse de suppression
 */
export const deleteEnterprise = async () => {
  try {
    const response = await API.delete("/mini-enterprise");
    return response.data;
  } catch (error) {
    console.error("Erreur deleteEnterprise:", error);
    throw error;
  }
};

/**
 * Enregistrer une vente
 * @param {number} productId - ID du produit
 * @param {number} quantity - Quantité vendue
 * @returns {Promise} Promesse avec les détails de la vente
 */
export const recordSale = async (productId, quantity) => {
  try {
    const response = await API.post("/mini-enterprise/sale", {
      productId,
      quantity: parseInt(quantity)
    });
    return response.data;
  } catch (error) {
    console.error("Erreur recordSale:", error);
    throw error;
  }
};

/**
 * Récupérer l'historique des ventes
 * @returns {Promise} Promesse avec l'historique
 */
export const getSalesHistory = async () => {
  try {
    const response = await API.get("/mini-enterprise/sales");
    return response.data;
  } catch (error) {
    console.error("Erreur getSalesHistory:", error);
    throw error;
  }
};

/**
 * Récupérer les statistiques de la mini-entreprise
 * @returns {Promise} Promesse avec les statistiques
 */
export const getEnterpriseStatistics = async () => {
  try {
    const response = await API.get("/mini-enterprise/statistics");
    return response.data;
  } catch (error) {
    console.error("Erreur getEnterpriseStatistics:", error);
    throw error;
  }
};

