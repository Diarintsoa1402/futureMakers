import { useEffect, useState, useCallback } from "react";
import { Sparkles, TrendingUp, Package, DollarSign, Award, Target, Lightbulb, ShoppingCart, X } from "lucide-react";

// Simuler les services API
const mockAPI = {
  getEnterprise: async () => {
    const stored = localStorage.getItem('childEnterprise');
    if (!stored) throw { response: { status: 404 } };
    return { data: JSON.parse(stored) };
  },
  updateEnterprise: async (data) => {
    localStorage.setItem('childEnterprise', JSON.stringify(data));
    return { data };
  },
  createEnterprise: async () => {
    const newData = {
      products: [],
      finances: { capital: 0, revenue: 0, expenses: 0 },
      level: 1,
      xp: 0,
      achievements: [],
      salesHistory: []
    };
    localStorage.setItem('childEnterprise', JSON.stringify(newData));
    return { data: newData };
  }
};

export default function MiniEnterprise() {
  const [enterprise, setEnterprise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsCreation, setNeedsCreation] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const [celebration, setCelebration] = useState(null);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saleQuantity, setSaleQuantity] = useState(1);

  const tips = [
    "💡 Astuce : Commence avec des produits simples à fabriquer !",
    "🎯 Conseil : Note bien tes dépenses pour savoir si tu gagnes de l'argent.",
    "🌟 Bravo : Chaque vente est une victoire !",
    "📊 Info : Un bon prix = coût de fabrication + un peu de bénéfice.",
    "🚀 Super : Plus tu vends, plus tu deviens un pro !"
  ];

  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    loadEnterprise();
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(tipInterval);
  }, []);

  const loadEnterprise = async () => {
    try {
      setLoading(true);
      const res = await mockAPI.getEnterprise();
      setEnterprise(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setNeedsCreation(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      const newEnterprise = await mockAPI.createEnterprise();
      setEnterprise(newEnterprise.data);
      setNeedsCreation(false);
      showCelebration("🎉 Félicitations ! Ta mini-entreprise est créée !");
    } finally {
      setLoading(false);
    }
  };

  const showCelebration = (message) => {
    setCelebration(message);
    setTimeout(() => setCelebration(null), 3000);
  };

  const handleSave = async () => {
    try {
      await mockAPI.updateEnterprise(enterprise);
      showCelebration("✨ Super ! Tout est sauvegardé !");
      
      const newXP = (enterprise.xp || 0) + 10;
      setEnterprise(prev => ({ ...prev, xp: newXP }));
    } catch (err) {
      alert("Oups ! Impossible de sauvegarder. Réessaie !");
    }
  };

  const addProduct = useCallback(() => {
    const productTemplates = [
      { emoji: "🍪", name: "Cookies", suggestedPrice: 2 },
      { emoji: "🎨", name: "Dessin", suggestedPrice: 5 },
      { emoji: "💍", name: "Bracelet", suggestedPrice: 3 },
      { emoji: "🌸", name: "Fleurs", suggestedPrice: 4 },
      { emoji: "📚", name: "Marque-page", suggestedPrice: 1 },
      { emoji: "🧸", name: "Peluche", suggestedPrice: 10 }
    ];
    
    const template = productTemplates[Math.floor(Math.random() * productTemplates.length)];
    
    const newProduct = { 
      id: Date.now(), 
      emoji: template.emoji,
      name: "", 
      price: template.suggestedPrice, 
      stock: 0,
      totalSold: 0
    };
    
    setEnterprise(prev => ({
      ...prev,
      products: [...(prev.products || []), newProduct],
    }));
  }, []);

  const updateProduct = useCallback((index, field, value) => {
    setEnterprise(prev => ({
      ...prev,
      products: prev.products.map((prod, i) =>
        i === index ? { ...prod, [field]: value } : prod
      ),
    }));
  }, []);

  const removeProduct = useCallback((index) => {
    setEnterprise(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  }, []);

  const updateFinance = useCallback((field, value) => {
    const numValue = parseFloat(value) || 0;
    setEnterprise(prev => ({
      ...prev,
      finances: {
        ...prev.finances,
        [field]: numValue,
      },
    }));
  }, []);

  const openSaleModal = (product) => {
    if (!product.name) {
      alert("Donne d'abord un nom à ce produit ! 😊");
      return;
    }
    if (product.stock === 0) {
      alert("Ce produit est en rupture de stock ! Ajoute du stock d'abord. 📦");
      return;
    }
    setSelectedProduct(product);
    setSaleQuantity(1);
    setShowSaleModal(true);
  };

  const handleSale = async () => {
    if (!selectedProduct || saleQuantity <= 0) return;

    const productIndex = enterprise.products.findIndex(p => p.id === selectedProduct.id);
    if (productIndex === -1) return;

    const product = enterprise.products[productIndex];

    if (saleQuantity > product.stock) {
      alert(`Tu n'as que ${product.stock} en stock ! 📦`);
      return;
    }

    const saleAmount = product.price * saleQuantity;
    
    // Créer l'enregistrement de vente
    const sale = {
      id: Date.now(),
      productName: product.name,
      emoji: product.emoji,
      quantity: saleQuantity,
      unitPrice: product.price,
      totalAmount: saleAmount,
      date: new Date().toISOString()
    };

    // Mettre à jour l'entreprise
    const updatedProducts = [...enterprise.products];
    updatedProducts[productIndex] = {
      ...product,
      stock: product.stock - saleQuantity,
      totalSold: (product.totalSold || 0) + saleQuantity
    };

    const updatedEnterprise = {
      ...enterprise,
      products: updatedProducts,
      finances: {
        ...enterprise.finances,
        revenue: enterprise.finances.revenue + saleAmount
      },
      salesHistory: [...(enterprise.salesHistory || []), sale],
      xp: (enterprise.xp || 0) + (saleQuantity * 5) // 5 XP par produit vendu
    };

    setEnterprise(updatedEnterprise);
    await mockAPI.updateEnterprise(updatedEnterprise);

    // Fermer la modal et célébrer
    setShowSaleModal(false);
    setSelectedProduct(null);
    showCelebration(`🎉 Vente réussie ! Tu as gagné ${saleAmount.toFixed(2)}€ !`);
  };

  const calculateProfit = () => {
    const { revenue = 0, expenses = 0 } = enterprise?.finances || {};
    return revenue - expenses;
  };

  const getLevel = () => {
    const xp = enterprise?.xp || 0;
    return Math.floor(xp / 100) + 1;
  };

  const getXPProgress = () => {
    const xp = enterprise?.xp || 0;
    return (xp % 100);
  };

  if (needsCreation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-8 text-center transform hover:scale-105 transition-transform">
          <div className="text-8xl mb-6 animate-bounce">🚀</div>
          <h1 className="text-4xl font-black text-gray-800 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Deviens un jeune entrepreneur !
          </h1>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            Crée ta propre entreprise, vends tes créations et apprends à gérer ton argent comme un chef ! 💰
          </p>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full px-10 py-5 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-2xl font-black text-2xl hover:from-green-500 hover:to-blue-600 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            {loading ? "⏳ Création..." : "🎪 Créer mon entreprise !"}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-8xl mb-4 animate-spin">⚙️</div>
          <p className="text-2xl font-bold">Chargement de ton entreprise...</p>
        </div>
      </div>
    );
  }

  if (!enterprise) return null;

  const { products = [], finances = { capital: 0, revenue: 0, expenses: 0 }, salesHistory = [] } = enterprise;
  const profit = calculateProfit();
  const level = getLevel();
  const xpProgress = getXPProgress();
  const totalSales = salesHistory.length;
  const totalItemsSold = salesHistory.reduce((sum, sale) => sum + sale.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-8 px-4">
      {celebration && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-8 py-4 rounded-full font-bold text-xl shadow-2xl animate-bounce">
          {celebration}
        </div>
      )}

      {/* Modal de vente */}
      {showSaleModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-black text-gray-800 flex items-center gap-2">
                <ShoppingCart className="w-8 h-8 text-green-500" />
                Nouvelle Vente
              </h3>
              <button 
                onClick={() => setShowSaleModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">{selectedProduct.emoji}</div>
                <h4 className="text-2xl font-bold text-gray-800">{selectedProduct.name}</h4>
                <p className="text-xl text-gray-600 mt-2">{selectedProduct.price.toFixed(2)}€ l'unité</p>
                <p className="text-sm text-gray-500 mt-1">Stock disponible : {selectedProduct.stock}</p>
              </div>

              <div className="mb-6">
                <label className="block text-lg font-bold text-gray-700 mb-3">
                  Quantité à vendre :
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.stock}
                  value={saleQuantity}
                  onChange={(e) => setSaleQuantity(Math.min(parseInt(e.target.value) || 1, selectedProduct.stock))}
                  className="w-full border-4 border-purple-400 p-4 rounded-xl text-3xl font-black text-center focus:ring-4 focus:ring-purple-500 bg-white"
                />
              </div>

              <div className="bg-white rounded-xl p-4 border-4 border-green-400">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-700">Total de la vente :</span>
                  <span className="text-3xl font-black text-green-600">
                    {(selectedProduct.price * saleQuantity).toFixed(2)}€
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSaleModal(false)}
                className="flex-1 px-6 py-4 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 font-bold text-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSale}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                💰 Vendre !
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* En-tête avec progression */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl shadow-xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                <Sparkles className="w-10 h-10" />
                Mon Entreprise
              </h1>
              <p className="text-lg opacity-90">Niveau {level} · Entrepreneur en herbe ! 🌱</p>
              <div className="mt-3 bg-white/20 rounded-full h-4 w-64">
                <div 
                  className="bg-yellow-300 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <p className="text-sm mt-1 opacity-80">{xpProgress}/100 XP jusqu'au niveau {level + 1}</p>
            </div>
            <button
              onClick={handleSave}
              className="px-8 py-4 bg-white text-purple-600 rounded-2xl hover:bg-yellow-300 font-black text-xl transition-all duration-200 transform hover:scale-110 shadow-lg"
            >
              💾 Sauvegarder
            </button>
          </div>
        </div>

        {/* Statistiques de vente */}
        {totalSales > 0 && (
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl shadow-lg p-5 mb-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <ShoppingCart className="w-10 h-10" />
                <div>
                  <p className="text-2xl font-black">{totalSales} vente{totalSales > 1 ? 's' : ''} réalisée{totalSales > 1 ? 's' : ''} !</p>
                  <p className="text-sm opacity-90">{totalItemsSold} produit{totalItemsSold > 1 ? 's' : ''} vendu{totalItemsSold > 1 ? 's' : ''} au total</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Chiffre d'affaires</p>
                <p className="text-3xl font-black">{finances.revenue.toFixed(2)}€</p>
              </div>
            </div>
          </div>
        )}

        {/* Conseil du jour */}
        {showTip && (
          <div className="bg-gradient-to-r from-yellow-300 to-orange-300 rounded-2xl shadow-lg p-5 mb-6 relative">
            <button 
              onClick={() => setShowTip(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 font-bold text-xl"
            >
              ×
            </button>
            <div className="flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-yellow-600" />
              <p className="text-lg font-bold text-gray-800">{tips[currentTip]}</p>
            </div>
          </div>
        )}

        {/* Tableau de bord financier */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg p-5 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-8 h-8" />
              <div className="text-sm font-bold">Capital</div>
            </div>
            <div className="text-3xl font-black">{finances.capital.toFixed(2)} €</div>
            <div className="text-xs opacity-80 mt-1">Ton argent de départ</div>
          </div>

          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg p-5 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8" />
              <div className="text-sm font-bold">Revenus</div>
            </div>
            <div className="text-3xl font-black">{finances.revenue.toFixed(2)} €</div>
            <div className="text-xs opacity-80 mt-1">Ce que tu as gagné</div>
          </div>

          <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-2xl shadow-lg p-5 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-8 h-8" />
              <div className="text-sm font-bold">Dépenses</div>
            </div>
            <div className="text-3xl font-black">{finances.expenses.toFixed(2)} €</div>
            <div className="text-xs opacity-80 mt-1">Ce que tu as dépensé</div>
          </div>

          <div className={`bg-gradient-to-br ${profit >= 0 ? 'from-yellow-400 to-yellow-600' : 'from-gray-400 to-gray-600'} rounded-2xl shadow-lg p-5 text-white transform hover:scale-105 transition-transform`}>
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-8 h-8" />
              <div className="text-sm font-bold">Bénéfice</div>
            </div>
            <div className="text-3xl font-black">{profit.toFixed(2)} €</div>
            <div className="text-xs opacity-80 mt-1">{profit >= 0 ? '🎉 Tu gagnes !' : '😔 En perte'}</div>
          </div>
        </div>

        {/* Section Produits avec vente */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
              <Package className="w-8 h-8 text-purple-500" />
              Mes Produits
            </h2>
            <button
              onClick={addProduct}
              className="px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-xl hover:from-green-500 hover:to-green-700 font-bold text-lg transition-all transform hover:scale-110 shadow-lg"
            >
              ➕ Nouveau produit
            </button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
              <div className="text-8xl mb-4">📦</div>
              <p className="text-2xl font-bold text-gray-700 mb-2">Aucun produit encore !</p>
              <p className="text-lg text-gray-600">Clique sur "Nouveau produit" pour commencer à vendre 🚀</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product, index) => (
                <div 
                  key={product.id} 
                  className="border-4 border-purple-200 rounded-2xl p-5 hover:border-purple-400 hover:shadow-xl transition-all bg-gradient-to-br from-white to-purple-50"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{product.emoji || "📦"}</div>
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        placeholder="Ex: Cookies maison"
                        value={product.name}
                        onChange={(e) => updateProduct(index, "name", e.target.value)}
                        className="w-full border-2 border-purple-300 p-3 rounded-xl text-lg font-bold focus:ring-4 focus:ring-purple-300 focus:border-purple-500 bg-white"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">💰 Prix (€)</label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={product.price}
                            onChange={(e) => updateProduct(index, "price", parseFloat(e.target.value) || 0)}
                            className="w-full border-2 border-green-300 p-2 rounded-lg text-lg font-bold focus:ring-4 focus:ring-green-300 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">📦 Stock</label>
                          <input
                            type="number"
                            min="0"
                            value={product.stock}
                            onChange={(e) => updateProduct(index, "stock", parseInt(e.target.value) || 0)}
                            className="w-full border-2 border-blue-300 p-2 rounded-lg text-lg font-bold focus:ring-4 focus:ring-blue-300 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      {product.totalSold > 0 && (
                        <div className="bg-green-100 rounded-lg p-2 text-center">
                          <p className="text-sm font-bold text-green-700">
                            🎉 {product.totalSold} vendu{product.totalSold > 1 ? 's' : ''} !
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openSaleModal(product)}
                          disabled={!product.name || product.stock === 0}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          🛒 Vendre
                        </button>
                        <button
                          onClick={() => removeProduct(index)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section Finances */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-3xl font-black text-gray-800 mb-6 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-500" />
            Ma Comptabilité
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border-4 border-blue-300">
              <label className="block text-lg font-black text-blue-800 mb-3">
                💵 Capital de départ (€)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={finances.capital}
                onChange={(e) => updateFinance("capital", e.target.value)}
                className="w-full border-4 border-blue-400 p-4 rounded-xl text-2xl font-black focus:ring-4 focus:ring-blue-500 bg-white"
              />
              <p className="text-sm text-blue-700 mt-2 font-bold">L'argent que tu avais au début</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border-4 border-green-300">
              <label className="block text-lg font-black text-green-800 mb-3">
                💰 Revenus (€)
              </label>
              <div className="w-full border-4 border-green-400 p-4 rounded-xl text-2xl font-black bg-gray-100 text-gray-600">
                {finances.revenue.toFixed(2)}
              </div>
              <p className="text-sm text-green-700 mt-2 font-bold">Calculé automatiquement avec les ventes</p>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border-4 border-red-300">
              <label className="block text-lg font-black text-red-800 mb-3">
                💸 Dépenses (€)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={finances.expenses}
                onChange={(e) => updateFinance("expenses", e.target.value)}
                className="w-full border-4 border-red-400 p-4 rounded-xl text-2xl font-black focus:ring-4 focus:ring-red-500 bg-white"
              />
              <p className="text-sm text-red-700 mt-2 font-bold">L'argent dépensé pour créer tes produits</p>
            </div>
          </div>

          {/* Explication pédagogique */}
          <div className="mt-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6 border-4 border-yellow-400">
            <h3 className="text-xl font-black text-gray-800 mb-3 flex items-center gap-2">
              🎓 Le sais-tu ?
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              <strong>Bénéfice = Revenus - Dépenses</strong><br/>
              Si tu vends des cookies à 2€ et que les ingrédients coûtent 0,50€, 
              ton bénéfice est de <span className="text-green-600 font-bold">1,50€</span> par cookie ! 🍪✨
            </p>
          </div>
        </div>

        {/* Historique des ventes */}
        {salesHistory.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mt-6">
            <h2 className="text-3xl font-black text-gray-800 mb-6 flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-green-500" />
              Historique des Ventes
            </h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {salesHistory.slice().reverse().map((sale) => (
                <div 
                  key={sale.id}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 hover:border-green-400 transition-colors"
                >
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{sale.emoji}</div>
                      <div>
                        <p className="text-lg font-bold text-gray-800">
                          {sale.productName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {sale.quantity} × {sale.unitPrice.toFixed(2)}€
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-green-600">
                        +{sale.totalAmount.toFixed(2)}€
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(sale.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}