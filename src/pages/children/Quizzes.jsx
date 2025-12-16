// ============================================
// frontend/src/pages/children/Quizzes.jsx - Version Enfants
// ============================================
import { useEffect, useState } from "react";
import { getAllQuizzes } from "../../services/quiz";
import { Link } from "react-router-dom";

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAllQuizzes();
      setQuizzes(res.data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des quiz");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🎯</div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-2xl font-black text-purple-700">Chargement des quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md border-4 border-red-300">
          <div className="text-8xl mb-4 text-center">😢</div>
          <div className="bg-red-100 border-4 border-red-400 text-red-700 px-6 py-4 rounded-2xl text-center font-bold mb-6">
            {error}
          </div>
          <button
            onClick={loadQuizzes}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-2xl font-black text-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12 bg-white rounded-3xl shadow-2xl border-4 border-purple-300">
            <div className="text-8xl mb-4">🎯</div>
            <h2 className="text-4xl font-black mb-4 text-purple-700">Aucun quiz disponible</h2>
            <p className="text-xl text-gray-600 font-bold">Les quiz arrivent bientôt ! Reviens plus tard ! 🚀</p>
          </div>
        </div>
      </div>
    );
  }

  // Séparer les quiz complétés et non complétés
  const completedQuizzes = quizzes.filter(q => q.completed);
  const availableQuizzes = quizzes.filter(q => !q.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 pb-12">
      {/* En-tête coloré */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white py-12 px-4 shadow-2xl">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-4 drop-shadow-lg animate-pulse">
            🎯 Mes Super Quiz ! 🎯
          </h1>
          <p className="text-2xl font-bold mb-6">
            Teste tes connaissances et gagne des médailles !
          </p>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="text-4xl font-black">{quizzes.length}</div>
              <div className="text-sm font-bold">🎯 Quiz totaux</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="text-4xl font-black">{completedQuizzes.length}</div>
              <div className="text-sm font-bold">✅ Terminés</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="text-4xl font-black">{availableQuizzes.length}</div>
              <div className="text-sm font-bold">🚀 À faire</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="text-4xl font-black">
                {completedQuizzes.filter(q => q.userResult?.badge === 'gold').length}
              </div>
              <div className="text-sm font-bold">🥇 Médailles Or</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8">
        {/* Quiz disponibles */}
        {availableQuizzes.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-3xl shadow-2xl p-6 border-4 border-green-300 mb-6">
              <h2 className="text-3xl font-black text-green-700 mb-2 flex items-center gap-2">
                🚀 Quiz à découvrir
              </h2>
              <p className="text-lg font-bold text-gray-600">
                {availableQuizzes.length} nouveau{availableQuizzes.length !== 1 ? 'x' : ''} quiz t'attend{availableQuizzes.length !== 1 ? 'ent' : ''} !
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableQuizzes.map(quiz => (
                <Link
                  key={quiz.id}
                  to={`/child/quizzes/${quiz.id}`}
                  className="group bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-4 border-green-300 hover:border-green-500"
                >
                  {/* Badge "Nouveau" */}
                  <div className="bg-gradient-to-r from-green-400 to-blue-500 p-6 relative overflow-hidden">
                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-black animate-pulse">
                      🆕 NOUVEAU
                    </div>
                    <div className="text-center">
                      <div className="text-6xl mb-2">🎯</div>
                      <div className="text-white font-black text-2xl">
                        Quiz #{quiz.id}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                      {quiz.title}
                    </h3>
                    
                    {quiz.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 font-medium">
                        {quiz.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-purple-100 text-purple-700 px-3 py-2 rounded-full text-sm font-black">
                        📝 {quiz.questionCount || 0} question{quiz.questionCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-4 text-center border-2 border-green-300">
                      <div className="text-green-700 font-black text-lg">
                        🚀 Commencer maintenant !
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quiz terminés */}
        {completedQuizzes.length > 0 && (
          <div>
            <div className="bg-white rounded-3xl shadow-2xl p-6 border-4 border-yellow-300 mb-6">
              <h2 className="text-3xl font-black text-yellow-700 mb-2 flex items-center gap-2">
                🏆 Quiz terminés
              </h2>
              <p className="text-lg font-bold text-gray-600">
                Bravo ! Tu as complété {completedQuizzes.length} quiz !
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedQuizzes.map(quiz => {
                const getBadgeGradient = (badge) => {
                  switch(badge) {
                    case 'gold': return 'from-yellow-400 to-yellow-600';
                    case 'silver': return 'from-gray-300 to-gray-500';
                    case 'bronze': return 'from-orange-400 to-orange-600';
                    default: return 'from-gray-300 to-gray-400';
                  }
                };

                return (
                  <Link
                    key={quiz.id}
                    to={`/child/quizzes/${quiz.id}`}
                    className="group bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-4 border-yellow-400"
                  >
                    {/* En-tête avec médaille */}
                    <div className={`bg-gradient-to-r ${getBadgeGradient(quiz.userResult?.badge)} p-6 relative`}>
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-black">
                        ✅ TERMINÉ
                      </div>
                      <div className="text-center">
                        <div className="text-7xl mb-2">
                          {quiz.userResult?.badge === 'gold' ? '🥇' : 
                           quiz.userResult?.badge === 'silver' ? '🥈' : 
                           quiz.userResult?.badge === 'bronze' ? '🥉' : '🎯'}
                        </div>
                        <div className="text-white font-black text-xl">
                          {quiz.userResult?.badge === 'gold' ? 'MÉDAILLE D\'OR !' : 
                           quiz.userResult?.badge === 'silver' ? 'MÉDAILLE D\'ARGENT' : 
                           quiz.userResult?.badge === 'bronze' ? 'MÉDAILLE DE BRONZE' : 'TERMINÉ'}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-2xl font-black text-gray-900 mb-3 line-clamp-2">
                        {quiz.title}
                      </h3>
                      
                      {quiz.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 font-medium">
                          {quiz.description}
                        </p>
                      )}
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between bg-white rounded-xl p-3 border-2 border-yellow-200">
                          <span className="font-bold text-gray-600">Score</span>
                          <span className="font-black text-xl text-yellow-700">
                            {quiz.userResult?.score}/{quiz.userResult?.maxScore}
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-white rounded-xl p-3 border-2 border-yellow-200">
                          <span className="font-bold text-gray-600">Pourcentage</span>
                          <span className="font-black text-xl text-green-600">
                            {quiz.userResult?.score && quiz.userResult?.maxScore 
                              ? Math.round((quiz.userResult.score / quiz.userResult.maxScore) * 100)
                              : 0}%
                          </span>
                        </div>
                      </div>

                      <div className="bg-blue-100 rounded-2xl p-4 text-center border-2 border-blue-300">
                        <div className="text-blue-700 font-black">
                          👁️ Voir mes résultats
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Message de motivation */}
        <div className="mt-12 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-3xl p-8 text-white text-center shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="text-7xl">🎓</div>
            <div>
              <h3 className="text-3xl font-black mb-2">Continue comme ça !</h3>
              <p className="text-xl font-bold">
                Plus tu fais de quiz, plus tu apprends ! Tu es génial ! 🌟
              </p>
            </div>
            <div className="text-7xl">🏆</div>
          </div>
        </div>
      </div>
    </div>
  );
}