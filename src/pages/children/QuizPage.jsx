
// ============================================
// frontend/src/pages/children/QuizPage.jsx - Version Enfants
// ============================================
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizById, submitQuiz } from "../../services/quiz";
import { toast } from "react-hot-toast";

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  useEffect(() => {
    if (id) {
      loadQuiz();
    }
  }, [id]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getQuizById(id);
      
      if (res.data.alreadyCompleted && res.data.result) {
        setAlreadyCompleted(true);
        setResult({
          result: res.data.result,
          percentage: Math.round((res.data.result.score / res.data.result.maxScore) * 100),
          success: res.data.result.score >= (res.data.result.maxScore / 2),
          badge: res.data.result.badge
        });
      }
      
      setQuiz(res.data);
    } catch (err) {
      console.error(err);
      setError("😕 Oups ! Erreur lors du chargement du quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, choiceIndex, isMultiple) => {
    if (alreadyCompleted) return;
    
    setAnswers(prev => {
      if (isMultiple) {
        const current = prev[questionId] || [];
        const newAnswers = current.includes(choiceIndex)
          ? current.filter(idx => idx !== choiceIndex)
          : [...current, choiceIndex];
        return { ...prev, [questionId]: newAnswers };
      } else {
        return { ...prev, [questionId]: [choiceIndex] };
      }
    });
  };

  const submit = async () => {
    if (alreadyCompleted) {
      toast.error("🚫 Tu as déjà fait ce quiz !");
      return;
    }

    const unansweredQuestions = quiz.Questions.filter(
      q => !answers[q.id] || answers[q.id].length === 0
    );

    if (unansweredQuestions.length > 0) {
      toast.error(`📝 Il reste ${unansweredQuestions.length} question${unansweredQuestions.length !== 1 ? 's' : ''} !`);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const { data } = await submitQuiz(id, answers);
      
      if (data.alreadyCompleted) {
        toast.error("🚫 Tu as déjà fait ce quiz !");
        setAlreadyCompleted(true);
        return;
      }
      
      setResult(data);
      setAlreadyCompleted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Toast personnalisé selon le résultat
      if (data.badge === 'gold') {
        toast.success("🥇 INCROYABLE ! Médaille d'Or !");
      } else if (data.badge === 'silver') {
        toast.success("🥈 SUPER ! Médaille d'Argent !");
      } else if (data.badge === 'bronze') {
        toast.success("🥉 BIEN JOUÉ ! Médaille de Bronze !");
      } else if (data.success) {
        toast.success("✅ Bravo ! Tu as réussi !");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.alreadyCompleted) {
        toast.error("🚫 Tu as déjà fait ce quiz !");
        setAlreadyCompleted(true);
      } else {
        toast.error("😕 Oups ! Une erreur s'est produite");
      }
    } finally {
      setSubmitting(false);
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

  const getBadgeGradient = (badge) => {
    switch(badge) {
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      case 'bronze': return 'from-orange-400 to-orange-600';
      default: return 'from-gray-300 to-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🎯</div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-2xl font-black text-purple-700">Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md border-4 border-red-300">
          <div className="text-8xl mb-4 text-center">😢</div>
          <div className="bg-red-100 border-4 border-red-400 text-red-700 px-6 py-4 rounded-2xl mb-6 font-bold text-center">
            {error}
          </div>
          <button
            onClick={() => navigate('/child/quizzes')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-2xl font-black text-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
          >
            ← Retour aux quiz
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz.Questions?.length || 0;
  const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 pb-12">
      {/* En-tête coloré */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white py-8 px-4 shadow-2xl">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/child/quizzes')}
            className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl font-bold hover:bg-white/30 transition-all transform hover:scale-105 mb-6 flex items-center gap-2"
          >
            ⬅️ Retour aux quiz
          </button>
          
          <div className="text-center">
            <div className="text-7xl mb-4">🎯</div>
            <h2 className="text-4xl md:text-5xl font-black mb-3 drop-shadow-lg">
              {quiz.title}
            </h2>
            {quiz.description && (
              <p className="text-xl font-bold mb-4">{quiz.description}</p>
            )}
            <div className="bg-white/20 backdrop-blur-sm inline-block px-6 py-2 rounded-full font-black text-lg">
              📝 {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        {/* Messages d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-4 border-red-400 text-red-700 rounded-2xl font-bold text-center">
            {error}
          </div>
        )}

        {/* Résultat */}
        {result && (
          <div className={`mb-6 rounded-3xl shadow-2xl overflow-hidden border-4 ${
            result.success 
              ? 'border-green-400' 
              : 'border-orange-400'
          }`}>
            <div className={`bg-gradient-to-r ${getBadgeGradient(result.badge)} p-8`}>
              <div className="text-center text-white">
                {alreadyCompleted && (
                  <div className="mb-4 bg-white/20 backdrop-blur-sm p-3 rounded-2xl font-bold">
                    ✅ Quiz déjà complété le {new Date(result.result.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                )}
                <div className="text-9xl mb-4">
                  {getBadgeEmoji(result.badge)}
                </div>
                <h3 className="text-4xl font-black mb-4 drop-shadow-lg">
                  {result.success ? '🎉 BRAVO !' : '💪 Continue !'}
                </h3>
                <div className="text-6xl font-black mb-4">
                  {result.result.score}/{result.result.maxScore}
                </div>
                <div className="text-3xl font-black mb-6">
                  Score: {result.percentage}%
                </div>
                {result.badge && (
                  <div className="bg-white/90 backdrop-blur-sm inline-block px-8 py-4 rounded-2xl mb-6">
                    <div className="text-gray-900 font-black text-2xl">
                      {result.badge === 'gold' ? '🥇 MÉDAILLE D\'OR !' :
                       result.badge === 'silver' ? '🥈 MÉDAILLE D\'ARGENT !' :
                       '🥉 MÉDAILLE DE BRONZE !'}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => navigate('/child/quizzes')}
                  className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-black text-xl hover:bg-purple-50 transition-all transform hover:scale-105"
                >
                  🏠 Retour aux quiz
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions */}
        {!result && !alreadyCompleted && (
          <>
            {/* Barre de progression */}
            <div className="mb-6 bg-white rounded-3xl shadow-2xl p-6 border-4 border-purple-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-black text-purple-700">🎯 Ta progression</span>
                <span className="text-2xl font-black text-purple-700">
                  {answeredCount}/{totalQuestions}
                </span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 h-full transition-all duration-500 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${progressPercentage}%` }}
                >
                  {progressPercentage > 10 && (
                    <span className="text-white font-bold text-sm">🚀</span>
                  )}
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6 mb-6">
              {quiz.Questions?.map((q, qIndex) => {
                let choices = [];
                try {
                  choices = typeof q.choices === "string" ? JSON.parse(q.choices) : q.choices;
                } catch (err) {
                  console.error("Erreur parsing choices", err);
                }

                const questionAnswers = answers[q.id] || [];
                const isAnswered = questionAnswers.length > 0;
                const isMultiple = choices.length > 2;

                return (
                  <div
                    key={q.id}
                    className={`bg-white rounded-3xl shadow-2xl overflow-hidden border-4 transition-all ${
                      isAnswered 
                        ? 'border-green-400' 
                        : 'border-purple-300'
                    }`}
                  >
                    <div className={`p-6 ${
                      isAnswered 
                        ? 'bg-gradient-to-r from-green-100 to-blue-100' 
                        : 'bg-gradient-to-r from-purple-100 to-pink-100'
                    }`}>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-black text-2xl flex-1">
                          <span className="text-purple-600 mr-2">Q{qIndex + 1}.</span>
                          {q.text}
                        </h3>
                        <div className="flex flex-col items-end gap-2">
                          <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-black">
                            ⭐ {q.points || 1} pt{q.points !== 1 ? 's' : ''}
                          </span>
                          {isAnswered && (
                            <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-black">
                              ✓ Répondu
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {choices.map((choice, idx) => {
                          const isSelected = questionAnswers.includes(idx);
                          const choiceText = choice.text || choice;
                          const choiceLetter = String.fromCharCode(65 + idx); // A, B, C, D...

                          return (
                            <label
                              key={idx}
                              className={`flex items-center p-4 rounded-2xl border-4 transition-all cursor-pointer transform hover:scale-102 ${
                                isSelected
                                  ? 'border-purple-500 bg-purple-100 shadow-lg'
                                  : 'border-gray-300 bg-white hover:border-purple-300 hover:shadow-md'
                              }`}
                            >
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl mr-4 ${
                                isSelected
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-gray-200 text-gray-600'
                              }`}>
                                {choiceLetter}
                              </div>
                              <input
                                type={isMultiple ? "checkbox" : "radio"}
                                name={`q-${q.id}`}
                                checked={isSelected}
                                onChange={() => handleAnswer(q.id, idx, isMultiple)}
                                className="hidden"
                              />
                              <span className="flex-1 font-bold text-lg text-gray-800">
                                {choiceText}
                              </span>
                              {isSelected && (
                                <span className="text-3xl">✓</span>
                              )}
                            </label>
                          );
                        })}
                      </div>

                      {isMultiple && (
                        <div className="mt-4 p-3 bg-blue-100 rounded-xl border-2 border-blue-300">
                          <p className="text-blue-800 font-bold text-sm">
                            💡 Astuce : Tu peux choisir plusieurs réponses !
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bouton de soumission */}
            <div className="sticky bottom-4 bg-white rounded-3xl shadow-2xl p-6 border-4 border-purple-300">
              <button
                onClick={submit}
                disabled={submitting || answeredCount < totalQuestions}
                className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-5 rounded-2xl font-black text-2xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-white"></div>
                    Envoi en cours...
                  </>
                ) : answeredCount < totalQuestions ? (
                  <>
                    📝 Réponds à toutes les questions
                  </>
                ) : (
                  <>
                    🎯 Envoyer mes réponses !
                  </>
                )}
              </button>
              
              <div className="mt-4 text-center">
                <p className="text-lg font-bold text-gray-600">
                  {answeredCount < totalQuestions ? (
                    <span className="text-orange-600">
                      ⚠️ Il te reste {totalQuestions - answeredCount} question{totalQuestions - answeredCount !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-green-600">
                      ✅ Toutes les questions sont répondues !
                    </span>
                  )}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Message de motivation */}
        {!result && (
          <div className="mt-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-6 text-white text-center shadow-2xl">
            <div className="flex items-center justify-center gap-4">
              <div className="text-5xl">🧠</div>
              <div>
                <h3 className="text-2xl font-black mb-1">Prends ton temps !</h3>
                <p className="text-lg font-bold">
                  Lis bien chaque question avant de répondre ! 📖
                </p>
              </div>
              <div className="text-5xl">💡</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}