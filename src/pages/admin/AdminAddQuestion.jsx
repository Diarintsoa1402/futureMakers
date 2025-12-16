// ============================================
// frontend/src/components/AdminAddQuestion.jsx
// ============================================
import { useState } from "react";
import { addQuestion } from "../../services/quiz";

export default function AdminAddQuestion({ quizId, onSaved }) {
  const [text, setText] = useState("");
  const [choices, setChoices] = useState([{ text: "" }, { text: "" }]);
  const [correct, setCorrect] = useState([]);
  const [points, setPoints] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChoiceChange = (i, value) => {
    const newChoices = [...choices];
    newChoices[i].text = value;
    setChoices(newChoices);
  };

  const addChoice = () => {
    if (choices.length < 6) {
      setChoices([...choices, { text: "" }]);
    }
  };

  const removeChoice = (i) => {
    if (choices.length > 2) {
      const newChoices = choices.filter((_, idx) => idx !== i);
      setChoices(newChoices);
      setCorrect(prev => prev.filter(idx => idx !== i).map(idx => idx > i ? idx - 1 : idx));
    }
  };

  const toggleCorrect = (i) => {
    setCorrect(prev =>
      prev.includes(i) ? prev.filter(c => c !== i) : [...prev, i]
    );
  };

  const resetForm = () => {
    setText("");
    setChoices([{ text: "" }, { text: "" }]);
    setCorrect([]);
    setPoints(1);
    setError("");
  };

  const validate = () => {
    if (!text.trim()) {
      setError("Le texte de la question est requis");
      return false;
    }

    const filledChoices = choices.filter(ch => ch.text.trim());
    if (filledChoices.length < 2) {
      setError("Au moins 2 choix sont requis");
      return false;
    }

    if (correct.length === 0) {
      setError("Veuillez sélectionner au moins une réponse correcte");
      return false;
    }

    if (points < 1) {
      setError("Les points doivent être au moins 1");
      return false;
    }

    return true;
  };

  const submit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      setError("");

      const filledChoices = choices.filter(ch => ch.text.trim());
      const adjustedCorrect = correct.filter(idx => idx < filledChoices.length);

      const payload = {
        text: text.trim(),
        choices: filledChoices,
        correct: adjustedCorrect,
        points: parseInt(points)
      };

      await addQuestion(quizId, payload);
      resetForm();
      onSaved?.();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de l'ajout de la question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 border-2 border-dashed border-gray-300 rounded-lg mb-4 bg-gray-50">
      <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
        <span>➕</span> Ajouter une question
      </h4>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {/* Texte de la question */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question *
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Entrez le texte de la question..."
          className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows="3"
        />
      </div>

      {/* Choix de réponses */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choix de réponses * (cochez les réponses correctes)
        </label>
        <div className="space-y-2">
          {choices.map((ch, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded text-sm font-medium">
                {String.fromCharCode(65 + i)}
              </span>
              <input
                type="text"
                value={ch.text}
                onChange={(e) => handleChoiceChange(i, e.target.value)}
                placeholder={`Choix ${i + 1}`}
                className="border border-gray-300 p-2 flex-1 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={correct.includes(i)}
                    onChange={() => toggleCorrect(i)}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Correct</span>
                </label>
                {choices.length > 2 && (
                  <button
                    onClick={() => removeChoice(i)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Supprimer ce choix"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {choices.length < 6 && (
          <button
            onClick={addChoice}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ➕ Ajouter un choix
          </button>
        )}
      </div>

      {/* Points */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Points *
        </label>
        <input
          type="number"
          value={points}
          onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
          min="1"
          max="100"
          className="border border-gray-300 p-2 w-32 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={loading}
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Enregistrement...' : '✓ Enregistrer la question'}
        </button>
        <button
          onClick={resetForm}
          disabled={loading}
          className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}