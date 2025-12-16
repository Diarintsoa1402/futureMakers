import { useEffect, useState } from "react";
import { getMentorships, updateProgress } from "../../services/mentorship";

export default function MentorshipList() {
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const loadMentorships = async () => {
    setLoading(true);
    try {
      const res = await getMentorships();
      setMentorships(res.data);
    } catch (error) {
      console.error("Erreur de chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadMentorships(); 
  }, []);

  const handleUpdate = async (id, progress, status) => {
    setUpdating(id);
    try {
      await updateProgress(id, { progress, status });
      await loadMentorships();
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "Planifié": "bg-blue-100 text-blue-700 border-blue-200",
      "En cours": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Terminé": "bg-green-100 text-green-700 border-green-200"
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getProgressColor = (progress) => {
    const colors = {
      "low": "bg-red-100 text-red-700 border-red-200",
      "medium": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "high": "bg-green-100 text-green-700 border-green-200"
    };
    return colors[progress] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getProgressLabel = (progress) => {
    const labels = {
      "low": "🔴 Faible",
      "medium": "🟡 Moyenne",
      "high": "🟢 Élevée"
    };
    return labels[progress] || progress;
  };

  const getStatusIcon = (status) => {
    const icons = {
      "Planifié": "📅",
      "En cours": "⏳",
      "Terminé": "✅"
    };
    return icons[status] || "📋";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Chargement des mentorats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            📊 Suivi des Mentorats
          </h1>
          <p className="text-gray-600">Gérez et suivez vos sessions de mentorat</p>
          {mentorships.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              {mentorships.length} session{mentorships.length > 1 ? 's' : ''} enregistrée{mentorships.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {mentorships.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-12 text-center shadow-lg animate-slide-up">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-600 text-lg font-medium">Aucun mentorat pour le moment.</p>
            <p className="text-gray-500 text-sm mt-2">Créez votre première session de mentorat</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {mentorships.map((m, index) => (
              <div
                key={m.id}
                className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-5 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-1">
                        {m.Project?.title || "Projet sans titre"}
                      </h3>
                      <p className="text-indigo-100 flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        {m.woman?.name || "Nom non disponible"}
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full border-2 font-semibold text-sm flex items-center gap-2 ${getStatusColor(m.status)} bg-white/90`}>
                      <span>{getStatusIcon(m.status)}</span>
                      {m.status}
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                      <p className="text-xs text-purple-600 uppercase font-semibold mb-2">💡 Thème</p>
                      <p className="text-gray-800 font-medium">{m.topic}</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                      <p className="text-xs text-blue-600 uppercase font-semibold mb-2">📆 Date</p>
                      <p className="text-gray-800 font-medium">
                        {m.date ? new Date(m.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : "Date non disponible"}
                      </p>
                    </div>
                  </div>

                  {m.notes && (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-100">
                      <p className="text-xs text-yellow-700 uppercase font-semibold mb-2">📝 Notes</p>
                      <p className="text-gray-700 leading-relaxed">{m.notes}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        📊 Niveau de Progression
                      </label>
                      <div className="relative">
                        <select
                          onChange={(e) => handleUpdate(m.id, e.target.value, m.status)}
                          value={m.progress}
                          disabled={updating === m.id}
                          className={`w-full px-4 py-3 border-2 rounded-xl font-semibold transition-all outline-none cursor-pointer ${getProgressColor(m.progress)} ${
                            updating === m.id ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                          }`}
                        >
                          <option value="low">🔴 Faible</option>
                          <option value="medium">🟡 Moyenne</option>
                          <option value="high">🟢 Élevée</option>
                        </select>
                        {updating === m.id && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-gray-700"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        🏷️ Statut de la Session
                      </label>
                      <div className="relative">
                        <select
                          onChange={(e) => handleUpdate(m.id, m.progress, e.target.value)}
                          value={m.status}
                          disabled={updating === m.id}
                          className={`w-full px-4 py-3 border-2 rounded-xl font-semibold transition-all outline-none cursor-pointer ${getStatusColor(m.status)} ${
                            updating === m.id ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                          }`}
                        >
                          <option value="Planifié">📅 Planifié</option>
                          <option value="En cours">⏳ En cours</option>
                          <option value="Terminé">✅ Terminé</option>
                        </select>
                        {updating === m.id && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-gray-700"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-600">État actuel:</span>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getProgressColor(m.progress)}`}>
                        {getProgressLabel(m.progress)}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(m.status)}`}>
                        {getStatusIcon(m.status)} {m.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out backwards;
        }
      `}</style>
    </div>
  );
}