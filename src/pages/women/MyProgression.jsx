import { useEffect, useState } from "react";
import { getMySessions } from "../../services/mentorshipSession";
import { getProgression } from "../../services/progression";

export default function MyMentorshipSessions() {
  const [sessions, setSessions] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, progressRes] = await Promise.all([
        getMySessions(),
        getProgression().catch(() => ({ data: null }))
      ]);
      setSessions(sessionsRes.data);
      setProgress(progressRes.data);
    } catch (err) {
      console.error("Erreur de chargement:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const getLevelColor = (level) => {
    const colors = {
      "Bas": "from-red-500 to-red-600",
      "Moyen": "from-yellow-500 to-yellow-600",
      "Élevé": "from-green-500 to-green-600"
    };
    return colors[level] || "from-gray-500 to-gray-600";
  };

  const getLevelBadge = (level) => {
    const badges = {
      "Bas": "bg-red-100 text-red-700 border-red-200",
      "Moyen": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Élevé": "bg-green-100 text-green-700 border-green-200"
    };
    return badges[level] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getLevelIcon = (level) => {
    const icons = {
      "Bas": "🌱",
      "Moyen": "🌿",
      "Élevé": "🌳"
    };
    return icons[level] || "📊";
  };

  const completedSessions = sessions.filter(s => s.status === "terminée").length;
  const plannedSessions = sessions.filter(s => s.status === "planifiée").length;
  const cancelledSessions = sessions.filter(s => s.status === "annulée").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Chargement de vos sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            🤝 Mon Parcours de Mentorat
          </h2>
          <p className="text-gray-600">Suivez vos sessions et votre progression</p>
        </div>

        {/* Section Progression */}
        {progress && progress.level !== "Aucune session" && (
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-6 mb-8 animate-slide-up">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <span className="text-3xl">📈</span>
              Votre Progression
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-600 uppercase font-semibold mb-1">Sessions Totales</p>
                <p className="text-3xl font-bold text-blue-700">{progress.total}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
                <p className="text-xs text-green-600 uppercase font-semibold mb-1">Terminées</p>
                <p className="text-3xl font-bold text-green-700">{progress.completed}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-200">
                <p className="text-xs text-purple-600 uppercase font-semibold mb-1">Taux de Complétion</p>
                <p className="text-3xl font-bold text-purple-700">{progress.percent}%</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-200 mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-700">Niveau de Progression</p>
                <div className={`px-4 py-2 rounded-full border-2 font-bold text-sm flex items-center gap-2 ${getLevelBadge(progress.level)}`}>
                  <span className="text-lg">{getLevelIcon(progress.level)}</span>
                  {progress.level}
                </div>
              </div>

              <div className="relative w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                <div
                  className={`h-6 bg-gradient-to-r ${getLevelColor(progress.level)} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                  style={{ width: `${progress.percent}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                </div>
              </div>
              <p className="text-center text-sm font-bold text-gray-700 mt-2">{progress.percent}% complété</p>
            </div>

            {progress.level === "Bas" && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                <p className="text-red-700 text-sm">
                  💪 <strong>Continuez vos efforts !</strong> Planifiez plus de sessions pour progresser.
                </p>
              </div>
            )}
            {progress.level === "Moyen" && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                <p className="text-yellow-700 text-sm">
                  🌟 <strong>Bon travail !</strong> Vous êtes sur la bonne voie, continuez ainsi.
                </p>
              </div>
            )}
            {progress.level === "Élevé" && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                <p className="text-green-700 text-sm">
                  🎉 <strong>Excellent !</strong> Vous avez une progression remarquable !
                </p>
              </div>
            )}
          </div>
        )}

        {/* Statistiques rapides */}
        {sessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in">
            <div className="bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-lg border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-semibold uppercase">Terminées</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{completedSessions}</p>
                </div>
                <div className="text-5xl">✅</div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-lg border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-semibold uppercase">Planifiées</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{plannedSessions}</p>
                </div>
                <div className="text-5xl">📅</div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-lg border-2 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-semibold uppercase">Annulées</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{cancelledSessions}</p>
                </div>
                <div className="text-5xl">❌</div>
              </div>
            </div>
          </div>
        )}

        {/* Liste des sessions */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg overflow-hidden animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4 text-white">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">📚</span>
              Mes Sessions de Mentorat
            </h3>
          </div>

          {sessions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 text-lg font-medium">Aucune session planifiée.</p>
              <p className="text-gray-500 text-sm mt-2">Les sessions avec votre mentor apparaîtront ici</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sessions.map((s, index) => (
                <div 
                  key={s.id} 
                  className="p-6 hover:bg-gray-50 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`px-4 py-2 rounded-full border-2 font-semibold text-sm flex items-center gap-2 ${getStatusBadge(s.status)}`}>
                          <span>{getStatusIcon(s.status)}</span>
                          {s.status}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                          <p className="text-xs text-purple-600 uppercase font-semibold mb-1">👤 Mentor</p>
                          <p className="text-gray-800 font-bold text-lg">{s.mentor?.name || "Non défini"}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-600 uppercase font-semibold mb-1">💡 Thème</p>
                            <p className="text-gray-800 font-medium">{s.theme}</p>
                          </div>

                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                            <p className="text-xs text-green-600 uppercase font-semibold mb-1">📆 Date</p>
                            <p className="text-gray-800 font-medium">
                              {new Date(s.date).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                              🕐 {new Date(s.date).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        {s.notes && s.status === "terminée" && (
                          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-100">
                            <p className="text-xs text-yellow-700 uppercase font-semibold mb-2">📝 Compte Rendu</p>
                            <p className="text-gray-700 leading-relaxed">{s.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message d'encouragement si pas de progression */}
        {(!progress || progress.level === "Aucune session") && sessions.length === 0 && (
          <div className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-4">
              <div className="text-6xl">🚀</div>
              <div>
                <p className="font-bold text-lg mb-1">Commencez votre parcours !</p>
                <p className="text-indigo-100">Planifiez votre première session avec un mentor pour débuter votre progression.</p>
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
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out backwards; }
        .animate-shimmer { animation: shimmer 2s infinite; }
      `}</style>
    </div>
  );
}