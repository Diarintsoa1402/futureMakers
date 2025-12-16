// src/components/Femme/ProgressDashboard.jsx
import { useEffect, useState } from "react";
import { getGlobalProgress } from "../../services/progress";

export default function ProgressDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getGlobalProgress()
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  if (!stats) return <div className="p-6">Chargement...</div>;

  const getStatusEmoji = (status) => {
    if (status === "bas") return "🔴";
    if (status === "moyen") return "🟡";
    return "🟢";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📊 Mon Avancement</h1>

      {/* Score global */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Score Global</h2>
            <p className="text-3xl font-bold">{stats.globalProgress}%</p>
            <p className="mt-2 flex items-center gap-2">
              {getStatusEmoji(stats.status)}
              <span className="font-semibold capitalize">Niveau {stats.status}</span>
            </p>
          </div>
          <div className="w-32 h-32">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="3"
              />
              <path
                className="circle"
                strokeDasharray={`${stats.globalProgress}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="white"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Détails par catégorie */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Formations */}
        <div className="bg-white border rounded-lg p-4 shadow">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            📚 Formations
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Score</span>
              <span className="font-bold">{stats.details.formations.score}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Terminées</span>
              <span className="font-bold text-green-600">{stats.details.formations.completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">En cours</span>
              <span className="font-bold text-blue-600">{stats.details.formations.inProgress}</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${stats.details.formations.score}%` }}
            />
          </div>
        </div>

        {/* Projet */}
        <div className="bg-white border rounded-lg p-4 shadow">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            💼 Projet
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Progression</span>
              <span className="font-bold">{stats.details.project.score}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Statut</span>
              <span className="font-bold capitalize">{stats.details.project.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Existe</span>
              <span>{stats.details.project.exists ? "✅" : "❌"}</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${stats.details.project.score}%` }}
            />
          </div>
        </div>

        {/* Mentorat */}
        <div className="bg-white border rounded-lg p-4 shadow">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            👩‍🏫 Mentorat
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Score</span>
              <span className="font-bold">{stats.details.mentorship.score}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Actifs</span>
              <span className="font-bold text-green-600">{stats.details.mentorship.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Terminés</span>
              <span className="font-bold text-purple-600">{stats.details.mentorship.completed}</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className="bg-purple-600 h-2 rounded-full"
              style={{ width: `${stats.details.mentorship.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recommandations */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-bold text-lg mb-3">💡 Recommandations</h3>
        <ul className="space-y-2">
          {stats.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-yellow-600">▸</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
