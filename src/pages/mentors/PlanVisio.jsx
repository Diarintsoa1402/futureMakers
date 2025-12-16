import React, { useState, useEffect } from "react";
import { planVisio, getMyVisios, cancelVisio, rescheduleVisio } from "../../services/visio";
import { getAllWomen } from "../../services/mentorshipSession";

export default function PlanVisio() {
  const [form, setForm] = useState({ femmeId: "", scheduledAt: "" });
  const [message, setMessage] = useState(null);
  const [women, setWomen] = useState([]);
  const [visios, setVisios] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [{ data: womenData }, { data: visiosData }] = await Promise.all([
        getAllWomen(),
        getMyVisios()
      ]);
      setWomen(womenData);
      setVisios(visiosData);
    } catch (err) {
      console.error("Erreur de chargement", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.femmeId || !form.scheduledAt) {
      setMessage({ type: "error", text: "Veuillez remplir tous les champs" });
      return;
    }

    try {
      setCreating(true);
      setMessage(null);
      await planVisio(form);
      setMessage({ type: "success", text: "Session planifiée ✅" });
      setForm({ femmeId: "", scheduledAt: "" });
      loadData();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur ❌" });
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = async (id) => {
    const reason = prompt("Raison de l'annulation (optionnel):");
    if (reason === null) return;
    
    try {
      setProcessing(id);
      await cancelVisio(id, { reason });
      setMessage({ type: "success", text: "Session annulée ❌" });
      loadData();
    } catch (err) {
      setMessage({ type: "error", text: "Erreur lors de l'annulation" });
    } finally {
      setProcessing(null);
    }
  };

  const handleReschedule = async (id) => {
    if (!newDate) {
      setMessage({ type: "error", text: "Veuillez sélectionner une nouvelle date" });
      return;
    }
    try {
      setProcessing(id);
      await rescheduleVisio(id, { scheduledAt: newDate });
      setMessage({ type: "success", text: "Session replanifiée 📅" });
      setEditingId(null);
      setNewDate("");
      loadData();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur" });
    } finally {
      setProcessing(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: "success", text: "Lien copié ! 📋" });
  };

  const getStatusBadge = (status) => {
    const badges = {
      "planifiée": "bg-blue-100 text-blue-700 border-blue-200",
      "en cours": "bg-green-100 text-green-700 border-green-200 animate-pulse",
      "terminée": "bg-gray-100 text-gray-700 border-gray-200",
      "annulée": "bg-red-100 text-red-700 border-red-200"
    };
    const icons = {
      "planifiée": "📅",
      "en cours": "🎥",
      "terminée": "✅",
      "annulée": "❌"
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 flex items-center gap-1 ${badges[status] || "bg-gray-100"}`}>
        <span>{icons[status]}</span>
        {status}
      </span>
    );
  };

  const upcomingVisios = visios.filter(v => v.status !== "annulée" && v.status !== "terminée");
  const pastVisios = visios.filter(v => v.status === "annulée" || v.status === "terminée");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Chargement des sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎥 Sessions Visio
          </h2>
          <p className="text-gray-600">Planifiez et gérez vos sessions de visioconférence</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-2xl shadow-lg animate-slide-down flex items-center gap-3 ${
            message.type === "success" 
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" 
              : "bg-gradient-to-r from-red-500 to-pink-500 text-white"
          }`}>
            <span className="text-2xl">{message.type === "success" ? "✅" : "❌"}</span>
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-6 animate-slide-up">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <span className="text-2xl">📅</span>
              Planifier une session
            </h3>

            <div className="space-y-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Femme</label>
                <select
                  name="femmeId"
                  value={form.femmeId}
                  onChange={handleChange}
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none group-hover:border-gray-300"
                >
                  <option value="">-- Choisir une femme --</option>
                  {women.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} — {w.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">🕐 Date & heure</label>
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  value={form.scheduledAt}
                  onChange={handleChange}
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none group-hover:border-gray-300"
                />
              </div>

              <button 
                onClick={handleSubmit}
                disabled={creating}
                className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                  creating 
                    ? "opacity-50 cursor-not-allowed" 
                    : "hover:from-purple-700 hover:to-pink-700 hover:shadow-xl hover:scale-105 active:scale-95"
                }`}
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Création...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">✨</span>
                    <span>Créer la session</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Statistiques
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <div className="text-3xl font-bold text-blue-600">{upcomingVisios.length}</div>
                <div className="text-sm text-gray-600 font-medium">À venir</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="text-3xl font-bold text-green-600">
                  {visios.filter(v => v.status === "terminée").length}
                </div>
                <div className="text-sm text-gray-600 font-medium">Terminées</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <div className="text-3xl font-bold text-purple-600">
                  {visios.filter(v => v.status === "en cours").length}
                </div>
                <div className="text-sm text-gray-600 font-medium">En cours</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-xl border border-red-200">
                <div className="text-3xl font-bold text-red-600">
                  {visios.filter(v => v.status === "annulée").length}
                </div>
                <div className="text-sm text-gray-600 font-medium">Annulées</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg overflow-hidden animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 text-white">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">🎥</span>
              Sessions à venir
            </h3>
          </div>

          {upcomingVisios.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 text-lg font-medium">Aucune session programmée</p>
              <p className="text-gray-500 text-sm mt-2">Créez votre première session visio</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {upcomingVisios.map((visio, index) => (
                <div key={visio.id} className="p-6 hover:bg-gray-50 transition-colors" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusBadge(visio.status)}
                        <span className="text-xs text-gray-500 font-medium">ID: {visio.id}</span>
                      </div>

                      {editingId === visio.id ? (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Nouvelle date</label>
                          <input
                            type="datetime-local"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="border-2 border-gray-200 p-3 w-full rounded-xl mb-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReschedule(visio.id)}
                              disabled={processing === visio.id}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl font-bold hover:from-blue-600 hover:to-indigo-600 transition-all"
                            >
                              {processing === visio.id ? "..." : "✅ Confirmer"}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-300 transition-all"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <h4 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                            <span>👤</span>
                            {visio.femme?.name}
                          </h4>
                          <p className="text-gray-600 flex items-center gap-2">
                            <span>📧</span>
                            {visio.femme?.email}
                          </p>
                          <div className="flex items-center gap-4 text-gray-600">
                            <p className="flex items-center gap-2">
                              <span>📅</span>
                              {new Date(visio.scheduledAt).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="flex items-center gap-2">
                              <span>🕐</span>
                              {new Date(visio.scheduledAt).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>

                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-purple-600 uppercase font-semibold mb-1">🔗 Lien de la session</p>
                                <a 
                                  href={visio.link} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-blue-600 hover:text-blue-700 text-sm break-all font-medium"
                                >
                                  {visio.link}
                                </a>
                              </div>
                              <button
                                onClick={() => copyToClipboard(visio.link)}
                                className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 flex-shrink-0"
                              >
                                📋 Copier
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {editingId !== visio.id && (
                      <div className="flex flex-col gap-2 lg:min-w-[140px]">
                        <button
                          onClick={() => window.open(visio.link, '_blank')}
                          disabled={processing === visio.id}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                        >
                          🎥 Rejoindre
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(visio.id);
                            setNewDate(visio.scheduledAt ? visio.scheduledAt.slice(0, 16) : "");
                          }}
                          disabled={processing === visio.id}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                        >
                          📅 Replanifier
                        </button>
                        <button
                          onClick={() => handleCancel(visio.id)}
                          disabled={processing === visio.id}
                          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                        >
                          ❌ Annuler
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {pastVisios.length > 0 && (
          <div className="mt-6 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg overflow-hidden animate-slide-up" style={{ animationDelay: "300ms" }}>
            <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">📚</span>
                Historique
              </h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {pastVisios.slice(0, 10).map((visio, index) => (
                <div key={visio.id} className="p-4 opacity-70 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(visio.status)}
                  </div>
                  <p className="font-bold text-gray-800">{visio.femme?.name}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(visio.scheduledAt).toLocaleString('fr-FR')}
                  </p>
                  {visio.cancelReason && (
                    <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded">
                      💬 {visio.cancelReason}
                    </p>
                  )}
                  {visio.link && (
                    <p className="text-xs text-gray-400 mt-2 break-all">
                      🔗 {visio.link}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out backwards; }
        .animate-slide-down { animation: slide-down 0.5s ease-out; }
      `}</style>
    </div>
  );
}