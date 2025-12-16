// frontend/src/pages/children/Badges.jsx
import { useEffect, useState } from "react";
import { getMyResults, getUserStats } from "../../services/quiz";
import { Link } from "react-router-dom";

export default function Badges() {
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Charger les résultats et les statistiques en parallèle
      const [resultsRes, statsRes] = await Promise.all([
        getMyResults(),
        getUserStats()
      ]);
      
      setResults(resultsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement de vos badges");
    } finally {
      setLoading(false);
    }
  };

  const getBadgeEmoji = (badge) => {
    switch(badge) {
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '🎯';
    }
  };

  const getBadgeColor = (badge) => {
    switch(badge) {
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'silver': return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 'bronze': return 'bg-gradient-to-r from-orange-400 to-orange-600';
      default: return 'bg-gray-300';
    }
  };

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos badges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12 bg-white rounded-lg shadow-md border">
          <div className="text-6xl mb-4">🏅</div>
          <h2 className="text-2xl font-bold mb-2">Aucun badge pour le moment</h2>
          <p className="text-gray-600 mb-6">
            Complète des quiz pour gagner tes premiers badges !
          </p>
          <Link
            to="/child/quizzes"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Découvrir les quiz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* En-tête avec titre */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          🏆 Mes Badges
        </h2>
        <p className="text-gray-600">
          Tous les badges que tu as gagnés en complétant les quiz
        </p>
      </div>

      {/* Statistiques globales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total de quiz complétés */}
          <div className="bg-white p-6 rounded-lg shadow-md border-2 border-indigo-200">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-3xl font-bold text-indigo-600">{stats.totalQuizzes}</div>
            <div className="text-sm text-gray-600">Quiz complétés</div>
          </div>

          {/* Score moyen */}
          <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-200">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-3xl font-bold text-blue-600">{stats.averageScore}%</div>
            <div className="text-sm text-gray-600">Score moyen</div>
          </div>

          {/* Badges Or */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg shadow-md border-2 border-yellow-300">
            <div className="text-3xl mb-2">🥇</div>
            <div className="text-3xl font-bold text-yellow-700">{stats.badges.gold}</div>
            <div className="text-sm text-yellow-800 font-medium">Badges Or</div>
          </div>

          {/* Badges Argent */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg shadow-md border-2 border-gray-300">
            <div className="text-3xl mb-2">🥈</div>
            <div className="text-3xl font-bold text-gray-700">{stats.badges.silver}</div>
            <div className="text-sm text-gray-800 font-medium">Badges Argent</div>
          </div>
        </div>
      )}

      {/* Liste des badges */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          🎖️ Historique des badges ({results.length})
        </h3>
        
        <div className="space-y-3">
          {results.map((r, index) => {
            const percentage = r.maxScore > 0 ? Math.round((r.score / r.maxScore) * 100) : 0;
            
            return (
              <div
                key={r.id}
                className="border-2 border-gray-200 p-5 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all bg-gradient-to-r from-white to-gray-50"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Badge visuel */}
                  <div className="flex-shrink-0">
                    <div className={`w-20 h-20 rounded-full ${getBadgeColor(r.badge)} flex items-center justify-center text-4xl shadow-lg`}>
                      {getBadgeEmoji(r.badge)}
                    </div>
                  </div>

                  {/* Informations du quiz */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-lg text-gray-800">
                          {r.Quiz?.title || `Quiz #${r.quizId}`}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Complété le {new Date(r.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      {r.badge && (
                        <span className={`px-4 py-2 rounded-full text-white font-bold text-sm ${getBadgeColor(r.badge)} shadow`}>
                          {r.badge.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Barre de progression du score */}
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-600">Score obtenu</span>
                        <span className={`font-bold text-lg ${getScoreColor(r.score, r.maxScore)}`}>
                          {r.score}/{r.maxScore} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            percentage >= 90 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            percentage >= 70 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                            percentage >= 50 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                            'bg-red-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Badge de performance */}
                    <div className="flex gap-2 flex-wrap mt-2">
                      {percentage === 100 && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
                          ⭐ Score Parfait !
                        </span>
                      )}
                      {percentage >= 90 && (
                        <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                          🎯 Excellent
                        </span>
                      )}
                      {index === 0 && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                          🆕 Plus récent
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bouton pour revoir le quiz */}
                  <div className="flex-shrink-0">
                    <Link
                      to={`/child/quizzes/${r.quizId}`}
                      className="block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center font-medium transition-colors"
                    >
                      Voir le quiz
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivation pour continuer */}
      <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border-2 border-indigo-200">
        <div className="flex items-center gap-4">
          <div className="text-5xl">🚀</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-indigo-900 mb-1">
              Continue sur ta lancée !
            </h3>
            <p className="text-indigo-700">
              Complète plus de quiz pour gagner encore plus de badges
            </p>
          </div>
          <Link
            to="/child/quizzes"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
          >
            Faire un quiz
          </Link>
        </div>
      </div>
    </div>
  );
}