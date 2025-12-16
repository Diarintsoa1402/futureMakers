import React, { useState, useEffect } from "react";
import {
  getMentorSessions,
  createSession,
  completeSession,
  cancelSession,
  rescheduleSession,
  getAllWomen,
} from "../../services/mentorshipSession";

export default function MentorshipSessions() {
  const [sessions, setSessions] = useState([]);
  const [women, setWomen] = useState([]);
  const [form, setForm] = useState({ femmeId: "", theme: "", date: "" });
  const [message, setMessage] = useState(null);
  const [filter, setFilter] = useState({ status: "all", timeframe: "all" });
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [processing, setProcessing] = useState(null);

  const [isSlideOpen, setIsSlideOpen] = useState(false);
  const [rescheduleSessionId, setRescheduleSessionId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [{ data: sessionsData }, { data: womenData }] = await Promise.all([
        getMentorSessions(),
        getAllWomen(),
      ]);
      setSessions(sessionsData);
      setWomen(womenData);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur chargement" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async () => {
    if (!form.femmeId || !form.theme || !form.date) {
      setMessage({ type: "error", text: "Veuillez remplir tous les champs" });
      return;
    }
    try {
      setCreating(true);
      setMessage(null);
      await createSession(form);
      setMessage({ type: "success", text: "Session créée ✅" });
      setForm({ femmeId: "", theme: "", date: "" });
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur ❌" });
    } finally {
      setCreating(false);
    }
  };

  const handleComplete = async (id) => {
    const notes = prompt("Entrez un compte rendu de la session :");
    if (notes === null) return;
    try {
      setProcessing(id);
      await completeSession(id, { notes });
      setMessage({ type: "success", text: "Session marquée terminée" });
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur" });
    } finally {
      setProcessing(null);
    }
  };

  const handleCancel = async (id) => {
    const reason = prompt("Raison de l'annulation (optionnel) :");
    if (reason === null) return;
    try {
      setProcessing(id);
      await cancelSession(id, { reason });
      setMessage({ type: "success", text: "Session annulée" });
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur" });
    } finally {
      setProcessing(null);
    }
  };

  const openReschedule = (id, currentDate) => {
    setRescheduleSessionId(id);
    setRescheduleDate(currentDate ? currentDate.slice(0, 16) : "");
    setIsSlideOpen(true);
  };

  const handleReschedule = async () => {
    if (!rescheduleDate) {
      setMessage({ type: "error", text: "Veuillez choisir une date" });
      return;
    }
    try {
      setRescheduling(true);
      await rescheduleSession(rescheduleSessionId, { date: rescheduleDate });
      setMessage({ type: "success", text: "Session replanifiée" });
      setIsSlideOpen(false);
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur" });
    } finally {
      setRescheduling(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (filter.status !== "all" && s.status !== filter.status) return false;
    if (filter.timeframe === "future") return new Date(s.date) > new Date();
    if (filter.timeframe === "past") return new Date(s.date) < new Date();
    return true;
  });

  const getStatusBadge = (status) => {
    const badges = {
      "planifiée": "bg-blue-100 text-blue-700 border-blue-200",
      "terminée": "bg-green-100 text-green-700 border-green-200",
      "annulée": "bg-red-100 text-red-700 border-red-200"
    };
    return badges[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      "planifiée": "📅",
      "terminée": "✅",
      "annulée": "❌"
    };
    return icons[status] || "📋";
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Chargement des sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            📅 Sessions de Mentorat
          </h2>
          <p className="text-gray-600">Planifiez et gérez vos sessions de mentorat</p>
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

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 p-6 rounded-2xl shadow-lg animate-slide-up">
            <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
              <span className="text-xl">➕</span>
              Planifier une session
            </h3>
            <div className="space-y-3">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-1">👤 Femme</label>
                <select
                  name="femmeId"
                  value={form.femmeId}
                  onChange={handleChange}
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none group-hover:border-gray-300"
                >
                  <option value="">-- Choisir une femme --</option>
                  {women.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} — {w.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-1">💡 Thème</label>
                <input
                  name="theme"
                  value={form.theme}
                  placeholder="Ex: Stratégie marketing..."
                  onChange={handleChange}
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none group-hover:border-gray-300"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-1">📆 Date & Heure</label>
                <input
                  type="datetime-local"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none group-hover:border-gray-300"
                />
              </div>

              <button 
                onClick={handleCreate} 
                disabled={creating}
                className={`w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                  creating 
                    ? "opacity-50 cursor-not-allowed" 
                    : "hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl hover:scale-105 active:scale-95"
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
                    <span>Créer la Session</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 p-6 rounded-2xl shadow-lg animate-slide-up" style={{ animationDelay: "100ms" }}>
            <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
              <span className="text-xl">🔍</span>
              Filtres
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Statut</label>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                >
                  <option value="all">📋 Tous</option>
                  <option value="planifiée">📅 Planifiées</option>
                  <option value="terminée">✅ Terminées</option>
                  <option value="annulée">❌ Annulées</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Période</label>
                <select
                  value={filter.timeframe}
                  onChange={(e) => setFilter({ ...filter, timeframe: e.target.value })}
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                >
                  <option value="all">🗓️ Toutes</option>
                  <option value="future">🔮 Futures</option>
                  <option value="past">⏮️ Passées</option>
                </select>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-xl border border-indigo-100">
                <p className="text-sm text-gray-600">Résultats trouvés</p>
                <p className="text-2xl font-bold text-indigo-600">{filteredSessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 p-6 rounded-2xl shadow-lg animate-slide-up" style={{ animationDelay: "200ms" }}>
            <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
              <span className="text-xl">📊</span>
              Statistiques
            </h3>
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-600 uppercase font-semibold">Total</p>
                <p className="text-2xl font-bold text-gray-800">{sessions.length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200">
                <p className="text-xs text-green-600 uppercase font-semibold">✅ Terminées</p>
                <p className="text-2xl font-bold text-green-700">{sessions.filter(s => s.status === "terminée").length}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-600 uppercase font-semibold">📅 Planifiées</p>
                <p className="text-2xl font-bold text-blue-700">{sessions.filter(s => s.status === "planifiée").length}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-3 rounded-xl border border-red-200">
                <p className="text-xs text-red-600 uppercase font-semibold">❌ Annulées</p>
                <p className="text-2xl font-bold text-red-700">{sessions.filter(s => s.status === "annulée").length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {filteredSessions.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-12 text-center shadow-lg">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 text-lg font-medium">Aucune session trouvée</p>
              <p className="text-gray-500 text-sm mt-2">Ajustez vos filtres ou créez une nouvelle session</p>
            </div>
          ) : (
            filteredSessions.map((s, index) => (
              <div
                key={s.id}
                className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`p-5 border-b-2 ${
                  s.status === "planifiée" ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200" :
                  s.status === "terminée" ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" :
                  "bg-gradient-to-r from-red-50 to-pink-50 border-red-200"
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-800 mb-1">
                        {s.femme?.name || "Nom non disponible"}
                      </h3>
                      <p className="text-gray-600 flex items-center gap-2 text-sm mb-2">
                        <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                        {s.theme}
                      </p>
                      <p className="text-gray-600 text-sm">
                        📆 {new Date(s.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full border-2 font-semibold text-sm flex items-center gap-2 ${getStatusBadge(s.status)}`}>
                      <span>{getStatusIcon(s.status)}</span>
                      {s.status}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {s.status === "terminée" && s.notes && (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-100 mb-4">
                      <p className="text-xs text-yellow-700 uppercase font-semibold mb-2">📝 Compte Rendu</p>
                      <p className="text-gray-700 leading-relaxed">{s.notes}</p>
                    </div>
                  )}

                  {s.status === "planifiée" && (
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => handleComplete(s.id)} 
                        disabled={processing === s.id}
                        className={`flex-1 min-w-[140px] bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                          processing === s.id 
                            ? "opacity-50 cursor-not-allowed" 
                            : "hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:scale-105 active:scale-95"
                        }`}
                      >
                        {processing === s.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <>
                            <span>✅</span>
                            <span>Terminer</span>
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => openReschedule(s.id, s.date)} 
                        disabled={processing === s.id}
                        className={`flex-1 min-w-[140px] bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                          processing === s.id 
                            ? "opacity-50 cursor-not-allowed" 
                            : "hover:from-yellow-600 hover:to-orange-600 hover:shadow-xl hover:scale-105 active:scale-95"
                        }`}
                      >
                        <span>📅</span>
                        <span>Replanifier</span>
                      </button>
                      <button 
                        onClick={() => handleCancel(s.id)} 
                        disabled={processing === s.id}
                        className={`flex-1 min-w-[140px] bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                          processing === s.id 
                            ? "opacity-50 cursor-not-allowed" 
                            : "hover:from-red-600 hover:to-pink-600 hover:shadow-xl hover:scale-105 active:scale-95"
                        }`}
                      >
                        <span>❌</span>
                        <span>Annuler</span>
                      </button>
                    </div>
                  )}

                  {s.status !== "planifiée" && (
                    <div className={`text-center py-3 px-4 rounded-xl font-semibold ${
                      s.status === "terminée"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {s.status === "terminée" ? "✅ Session terminée" : "❌ Session annulée"}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {isSlideOpen && (
          <div className="fixed inset-0 z-50 flex animate-fade-in">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSlideOpen(false)} />
            <div className="ml-auto w-full md:w-1/3 bg-white shadow-2xl animate-slide-in-right flex flex-col">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <span>📅</span>
                  Replanifier la session
                </h3>
              </div>
              
              <div className="flex-1 p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">🗓️ Nouvelle date et heure</label>
                <input
                  type="datetime-local"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button 
                  onClick={handleReschedule} 
                  disabled={rescheduling}
                  className={`flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    rescheduling 
                      ? "opacity-50 cursor-not-allowed" 
                      : "hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl"
                  }`}
                >
                  {rescheduling ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Sauvegarde...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Sauvegarder</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setIsSlideOpen(false)} 
                  disabled={rescheduling}
                  className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
              </div>
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
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out backwards; }
        .animate-slide-down { animation: slide-down 0.5s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
      `}</style>
    </div>
  );
}