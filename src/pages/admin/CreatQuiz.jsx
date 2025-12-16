// ============================================
// frontend/src/pages/admin/AdminQuizzes.jsx
// ============================================
import { useEffect, useState } from "react";
import { 
  getAllQuizzesAdmin, 
  createQuiz, 
  deleteQuiz, 
  getQuizById,
  deleteQuestion 
} from "../../services/quiz";
import AdminAddQuestion from "./AdminAddQuestion";

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [newQuiz, setNewQuiz] = useState({ title: "", description: "" });
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const showMessage = (message, type = "error") => {
    if (type === "success") {
      setSuccess(message);
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(message);
      setSuccess("");
      setTimeout(() => setError(""), 5000);
    }
  };

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const response = await getAllQuizzesAdmin();
      setQuizzes(response.data);
      setError("");
    } catch (err) {
      console.error("Erreur chargement quizzes:", err);
      showMessage("Erreur lors du chargement des quiz");
    } finally {
      setLoading(false);
    }
  };

  const loadQuiz = async (id) => {
    setLoading(true);
    try {
      const { data } = await getQuizById(id);
      setSelectedQuiz(data);
      setQuestions(data.Questions || []);
      setError("");
    } catch (err) {
      console.error("Erreur chargement quiz:", err);
      showMessage("Erreur lors du chargement du quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const create = async () => {
    if (!newQuiz.title.trim()) {
      showMessage("Le titre du quiz est requis");
      return;
    }

    setLoading(true);
    try {
      await createQuiz(newQuiz);
      setNewQuiz({ title: "", description: "" });
      showMessage("Quiz créé avec succès", "success");
      loadQuizzes();
    } catch (err) {
      console.error("Erreur création quiz:", err);
      showMessage(err.response?.data?.message || "Erreur lors de la création du quiz");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce quiz ? Cette action est irréversible.")) {
      return;
    }

    setLoading(true);
    try {
      await deleteQuiz(id);
      if (selectedQuiz?.id === id) {
        setSelectedQuiz(null);
        setQuestions([]);
      }
      showMessage("Quiz supprimé avec succès", "success");
      loadQuizzes();
    } catch (err) {
      console.error("Erreur suppression quiz:", err);
      showMessage("Erreur lors de la suppression du quiz");
    } finally {
      setLoading(false);
    }
  };

  const removeQuestion = async (questionId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
      return;
    }

    try {
      await deleteQuestion(questionId);
      showMessage("Question supprimée avec succès", "success");
      loadQuiz(selectedQuiz.id);
    } catch (err) {
      console.error("Erreur suppression question:", err);
      showMessage("Erreur lors de la suppression de la question");
    }
  };

  const handleQuizSelect = (quiz) => {
    if (selectedQuiz?.id === quiz.id) {
      setSelectedQuiz(null);
      setQuestions([]);
    } else {
      loadQuiz(quiz.id);
    }
  };

  const parseChoices = (choices) => {
    try {
      return typeof choices === "string" ? JSON.parse(choices) : choices;
    } catch (err) {
      console.error("Erreur parsing choices:", err);
      return [];
    }
  };

  const parseCorrectAnswers = (correct) => {
    try {
      const parsed = typeof correct === "string" ? JSON.parse(correct) : correct;
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (err) {
      console.error("Erreur parsing correct:", err);
      return [];
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">🎯 Gestion des Quiz</h2>

      {/* Messages d'alerte */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Création de quiz */}
      <div className="bg-white p-6 rounded-lg shadow-md border mb-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>➕</span> Créer un nouveau quiz
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre *
            </label>
            <input
              placeholder="Ex: Quiz de mathématiques"
              value={newQuiz.title}
              onChange={e => setNewQuiz({ ...newQuiz, title: e.target.value })}
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              placeholder="Ex: Testez vos connaissances en maths"
              value={newQuiz.description}
              onChange={e => setNewQuiz({ ...newQuiz, description: e.target.value })}
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={create}
              disabled={loading || !newQuiz.title.trim()}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? "Création..." : "✓ Créer le quiz"}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des quiz */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">📋 Liste des Quiz</h3>
          <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
            {quizzes.length} quiz{quizzes.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading && !quizzes.length ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des quiz...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-lg font-medium">Aucun quiz créé pour le moment.</p>
            <p className="text-sm mt-2">Commencez par créer votre premier quiz !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map(quiz => (
              <div
                key={quiz.id}
                className={`border-2 rounded-lg p-5 transition-all ${
                  selectedQuiz?.id === quiz.id 
                    ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div 
                    onClick={() => handleQuizSelect(quiz)}
                    className="flex-1 cursor-pointer"
                  >
                    <h4 className="font-bold text-xl hover:text-indigo-600 transition-colors">
                      {quiz.title}
                    </h4>
                    {quiz.description && (
                      <p className="text-gray-600 mt-1">
                        {quiz.description}
                      </p>
                    )}
                    <div className="flex gap-6 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">{quiz.Questions?.length || 0}</span> 
                        question{(quiz.Questions?.length || 0) !== 1 ? 's' : ''}
                      </span>
                      <span>
                        Créé le {new Date(quiz.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleQuizSelect(quiz)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedQuiz?.id === quiz.id
                          ? 'bg-gray-600 text-white hover:bg-gray-700'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {selectedQuiz?.id === quiz.id ? '▲ Masquer' : '▼ Gérer'}
                    </button>
                    <button
                      onClick={() => remove(quiz.id)}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      🗑 Supprimer
                    </button>
                  </div>
                </div>

                {/* Questions du quiz sélectionné */}
                {selectedQuiz?.id === quiz.id && (
                  <div className="mt-6 pt-6 border-t-2 border-gray-200">
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <span>❓</span> Questions ({questions.length})
                    </h4>

                    {/* Formulaire d'ajout de question */}
                    <AdminAddQuestion
                      quizId={selectedQuiz.id}
                      onSaved={() => {
                        loadQuiz(selectedQuiz.id);
                        showMessage("Question ajoutée avec succès", "success");
                      }}
                    />

                    {/* Liste des questions existantes */}
                    <div className="mt-6">
                      {questions.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <div className="text-4xl mb-2">📝</div>
                          <p className="text-gray-600 font-medium">Aucune question pour ce quiz.</p>
                          <p className="text-sm text-gray-500 mt-1">Ajoutez votre première question ci-dessus !</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {questions.map((q, index) => {
                            const choices = parseChoices(q.choices);
                            const correctAnswers = parseCorrectAnswers(q.correct);
                            
                            return (
                              <div
                                key={q.id}
                                className="border-2 border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <h5 className="font-semibold text-lg flex-1">
                                    <span className="text-indigo-600 mr-2">Q{index + 1}.</span>
                                    {q.text}
                                  </h5>
                                  <div className="flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                                      {q.points || 1} pt{q.points !== 1 ? 's' : ''}
                                    </span>
                                    <button
                                      onClick={() => removeQuestion(q.id)}
                                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                                      title="Supprimer cette question"
                                    >
                                      🗑
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  {choices.map((choice, idx) => {
                                    const isCorrect = correctAnswers.includes(idx);
                                    const choiceText = choice.text || choice;
                                    
                                    return (
                                      <div
                                        key={idx}
                                        className={`flex items-center p-3 rounded-lg border-2 ${
                                          isCorrect 
                                            ? 'bg-green-50 border-green-300' 
                                            : 'bg-gray-50 border-gray-200'
                                        }`}
                                      >
                                        <span className="w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full text-sm font-bold mr-3">
                                          {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span className={`flex-1 ${isCorrect ? 'font-semibold text-green-800' : 'text-gray-700'}`}>
                                          {choiceText}
                                        </span>
                                        {isCorrect && (
                                          <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                                            ✓ Correct
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                
                                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                                  <span>
                                    {correctAnswers.length > 1 ? (
                                      <span className="font-medium">🔄 Réponses multiples</span>
                                    ) : (
                                      <span className="font-medium">⚡ Réponse unique</span>
                                    )}
                                  </span>
                                  <span>
                                    Créée le {new Date(q.createdAt).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}