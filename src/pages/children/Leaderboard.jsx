// frontend/src/pages/children/Ranking.jsx
import { useEffect, useState } from "react";
import { getRanking, getMyRank } from "../../services/leaderboard";

export default function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myRank, setMyRank] = useState(null);
  const [view, setView] = useState("all"); // all, friends, topTen

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [rankingRes, myRankRes] = await Promise.all([
        getRanking({ limit: 100, role: "child" }),
        getMyRank()
      ]);
      
      setRanking(rankingRes.data.data || []);
      setMyRank(myRankRes.data.data);
    } catch (err) {
      console.error("Erreur lors du chargement du classement:", err);
      setError("Impossible de charger le classement");
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    if (rank <= 10) return "⭐";
    return "🎯";
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "from-yellow-400 to-yellow-600";
    if (rank === 2) return "from-gray-300 to-gray-500";
    if (rank === 3) return "from-orange-400 to-orange-600";
    if (rank <= 10) return "from-blue-300 to-blue-500";
    return "from-gray-200 to-gray-400";
  };

  const getEncouragementMessage = (rank) => {
    if (!rank) return "";
    if (rank === 1) return "🎉 Tu es le champion ! Continue comme ça !";
    if (rank === 2) return "🌟 Presque au sommet ! Encore un effort !";
    if (rank === 3) return "🚀 Super ! Tu es sur le podium !";
    if (rank <= 10) return "💪 Excellent ! Tu fais partie du Top 10 !";
    if (rank <= 20) return "👍 Très bien ! Continue à progresser !";
    return "🎯 Continue tes efforts, tu vas y arriver !";
  };

  const getFilteredRanking = () => {
    if (view === "topTen") return ranking.slice(0, 10);
    // Pour "friends" et "all", retourner tout le classement
    // La logique "friends" peut être implémentée plus tard
    return ranking;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement du classement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-lg text-center">
          <p className="text-2xl mb-2">😕</p>
          <p className="font-semibold">{error}</p>
        </div>
        <button
          onClick={loadData}
          className="mt-4 mx-auto block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const filteredRanking = getFilteredRanking();

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* En-tête ludique */}
      <div className="mb-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-transparent bg-clip-text">
          🏆 Tableau des Champions 🏆
        </h2>
        <p className="text-lg text-gray-600">
          Découvre les meilleurs élèves et leurs super scores !
        </p>
      </div>

      {/* Ma position - Carte mise en avant */}
      {myRank && (
        <div className={`bg-gradient-to-r ${getRankColor(myRank.rank)} p-1 rounded-2xl mb-6 shadow-xl`}>
          <div className="bg-white rounded-2xl p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Position et médaille */}
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-600 mb-1">🎯 Ta position</p>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <span className="text-6xl">{getMedalEmoji(myRank.rank)}</span>
                  <div>
                    <p className="text-4xl font-bold text-gray-800">
                      #{myRank.rank}
                    </p>
                    <p className="text-sm text-gray-600">
                      sur {ranking.length} élèves
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistiques */}
              <div className="flex gap-4 md:gap-6">
                <div className="text-center bg-purple-50 p-4 rounded-xl">
                  <p className="text-3xl font-bold text-purple-600">{myRank.totalScore}</p>
                  <p className="text-xs text-gray-600">⭐ Points totaux</p>
                </div>
                <div className="text-center bg-blue-50 p-4 rounded-xl">
                  <p className="text-3xl font-bold text-blue-600">{myRank.quizScore || 0}</p>
                  <p className="text-xs text-gray-600">📝 Quiz réussis</p>
                </div>
              </div>
            </div>

            {/* Message d'encouragement */}
            <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
              <p className="text-center text-yellow-800 font-medium">
                {getEncouragementMessage(myRank.rank)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtres ludiques */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        <button
          onClick={() => setView("all")}
          className={`px-6 py-3 rounded-full font-bold transition-all ${
            view === "all"
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          🌍 Tous les champions
        </button>
        <button
          onClick={() => setView("topTen")}
          className={`px-6 py-3 rounded-full font-bold transition-all ${
            view === "topTen"
              ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-105"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          ⭐ Top 10
        </button>
        <button
          onClick={loadData}
          className="px-6 py-3 rounded-full font-bold bg-green-500 text-white hover:bg-green-600 transition-all"
        >
          🔄 Actualiser
        </button>
      </div>

      {/* Podium pour le Top 3 */}
      {view === "topTen" && filteredRanking.length >= 3 && (
        <div className="mb-8">
          <div className="flex items-end justify-center gap-4 mb-8">
            {/* 2ème place */}
            {filteredRanking[1] && (
              <div className="flex-1 max-w-xs">
                <div className="bg-gradient-to-b from-gray-300 to-gray-500 rounded-t-2xl p-6 text-center shadow-lg transform hover:scale-105 transition-all">
                  <div className="text-6xl mb-3">🥈</div>
                  <div className="bg-white w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl font-bold shadow-inner">
                    2
                  </div>
                  <p className="font-bold text-white text-lg mb-2">{filteredRanking[1].name}</p>
                  <p className="text-white text-2xl font-bold">{filteredRanking[1].totalScore} pts</p>
                </div>
                <div className="bg-gray-400 h-24 rounded-b-lg"></div>
              </div>
            )}

            {/* 1ère place - Plus haute */}
            {filteredRanking[0] && (
              <div className="flex-1 max-w-xs">
                <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-t-2xl p-6 text-center shadow-xl transform hover:scale-105 transition-all">
                  <div className="text-7xl mb-3 animate-bounce">🥇</div>
                  <div className="bg-white w-24 h-24 rounded-full mx-auto mb-3 flex items-center justify-center text-5xl font-bold shadow-inner">
                    1
                  </div>
                  <p className="font-bold text-white text-xl mb-2">{filteredRanking[0].name}</p>
                  <p className="text-white text-3xl font-bold">{filteredRanking[0].totalScore} pts</p>
                </div>
                <div className="bg-yellow-500 h-32 rounded-b-lg"></div>
              </div>
            )}

            {/* 3ème place */}
            {filteredRanking[2] && (
              <div className="flex-1 max-w-xs">
                <div className="bg-gradient-to-b from-orange-400 to-orange-600 rounded-t-2xl p-6 text-center shadow-lg transform hover:scale-105 transition-all">
                  <div className="text-6xl mb-3">🥉</div>
                  <div className="bg-white w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl font-bold shadow-inner">
                    3
                  </div>
                  <p className="font-bold text-white text-lg mb-2">{filteredRanking[2].name}</p>
                  <p className="text-white text-2xl font-bold">{filteredRanking[2].totalScore} pts</p>
                </div>
                <div className="bg-orange-500 h-20 rounded-b-lg"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Liste du classement - Version carte pour enfants */}
      <div className="space-y-3">
        {filteredRanking.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-xl text-gray-600">Aucun résultat à afficher</p>
          </div>
        ) : (
          filteredRanking.map((user, index) => {
            const isTopThree = user.rank <= 3;
            const isCurrentUser = user.isCurrentUser;
            
            return (
              <div
                key={user.userId}
                className={`relative rounded-2xl p-5 shadow-md transition-all hover:shadow-xl hover:scale-102 ${
                  isCurrentUser
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-3 border-indigo-400"
                    : isTopThree
                    ? "bg-gradient-to-r from-yellow-50 to-orange-50"
                    : "bg-white"
                }`}
              >
                {/* Badge "C'est toi !" */}
                {isCurrentUser && (
                  <div className="absolute -top-3 -right-3 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                    👋 C'est toi !
                  </div>
                )}

                <div className="flex items-center gap-4">
                  {/* Position avec médaille */}
                  <div className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${getRankColor(user.rank)} flex items-center justify-center shadow-lg`}>
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl">{getMedalEmoji(user.rank)}</div>
                      {!isTopThree && (
                        <div className="text-xs font-bold text-white">#{user.rank}</div>
                      )}
                    </div>
                  </div>

                  {/* Informations de l'utilisateur */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg md:text-xl text-gray-800 truncate">
                        {user.name}
                      </h3>
                      {isTopThree && (
                        <span className="text-2xl">👑</span>
                      )}
                    </div>
                    
                    {/* Barre de progression visuelle */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progression</span>
                        <span className="font-semibold">{user.averageScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${
                            user.averageScore >= 90 ? "from-green-400 to-green-600" :
                            user.averageScore >= 70 ? "from-blue-400 to-blue-600" :
                            "from-yellow-400 to-orange-500"
                          }`}
                          style={{ width: `${user.averageScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Statistiques en badges */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                        📝 {user.quizScore} pts quiz
                      </span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                        📚 {user.completedCourses || 0} cours
                      </span>
                    </div>
                  </div>

                  {/* Score total - Grand et visible */}
                  <div className="flex-shrink-0 text-center">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white px-4 py-3 rounded-2xl shadow-lg">
                      <p className="text-2xl md:text-3xl font-bold">{user.totalScore}</p>
                      <p className="text-xs opacity-90">points</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message motivant en bas */}
      <div className="mt-8 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 p-6 rounded-2xl border-2 border-purple-200">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
          <div className="text-6xl">🎓</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-purple-900 mb-2">
              Continue d'apprendre et de t'amuser !
            </h3>
            <p className="text-purple-700">
              Plus tu fais de quiz et de cours, plus tu gagnes de points et tu montes dans le classement ! 🚀
            </p>
          </div>
          <div className="text-6xl">⭐</div>
        </div>
      </div>
    </div>
  );
}