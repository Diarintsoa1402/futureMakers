// frontend/src/components/admin/QuestionForm.jsx
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";

export default function QuestionForm({  onSaved, isLoading = false }) {
  const [text, setText] = useState("");
  const [choices, setChoices] = useState([{ text: "" }, { text: "" }]);
  const [correct, setCorrect] = useState([]);
  const [points, setPoints] = useState(1);
  const [errors, setErrors] = useState({});

  const handleChoiceChange = (index, value) => {
    const newChoices = [...choices];
    newChoices[index].text = value;
    setChoices(newChoices);
    
    if (errors[`choice-${index}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`choice-${index}`];
        return newErrors;
      });
    }
  };

  const addChoice = () => {
    if (choices.length < 10) {
      setChoices([...choices, { text: "" }]);
    }
  };

  const removeChoice = (index) => {
    if (choices.length > 2) {
      const newChoices = choices.filter((_, i) => i !== index);
      setChoices(newChoices);
      
      const newCorrect = correct
        .filter(i => i !== index)
        .map(i => i > index ? i - 1 : i);
      setCorrect(newCorrect);
    }
  };

  const toggleCorrect = (index) => {
    setCorrect(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
    
    if (errors.correct) {
      setErrors(prev => ({ ...prev, correct: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!text.trim()) {
      newErrors.text = "La question est requise";
    }
    
    choices.forEach((choice, index) => {
      if (!choice.text.trim()) {
        newErrors[`choice-${index}`] = "Ce choix ne peut pas être vide";
      }
    });
    
    if (correct.length === 0) {
      newErrors.correct = "Vous devez sélectionner au moins une réponse correcte";
    }
    
    if (points < 1 || points > 100) {
      newErrors.points = "Les points doivent être entre 1 et 100";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = { text, choices, correct, points };
    
    try {
      await onSaved(payload);
      
      // Reset form
      setText("");
      setChoices([{ text: "" }, { text: "" }]);
      setCorrect([]);
      setPoints(1);
      setErrors({});
    } catch (error) {
      setErrors({ submit: error.message || "Erreur lors de l'enregistrement" });
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md border border-blue-200">
      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">➕</span> Nouvelle question
      </h4>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (errors.text) setErrors(prev => ({ ...prev, text: null }));
          }}
          placeholder="Quelle est la capitale de la France ?"
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
            errors.text ? "border-red-500" : "border-gray-300"
          }`}
          disabled={isLoading}
        />
        {errors.text && <p className="mt-1 text-sm text-red-500">{errors.text}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choix de réponses <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {choices.map((choice, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={choice.text}
                onChange={(e) => handleChoiceChange(index, e.target.value)}
                placeholder={`Choix ${index + 1}`}
                className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  errors[`choice-${index}`] ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isLoading}
              />
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={correct.includes(index)}
                  onChange={() => toggleCorrect(index)}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-600">Correct</span>
              </label>
              
              {choices.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeChoice(index)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                  disabled={isLoading}
                  title="Supprimer ce choix"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.correct && <p className="mt-1 text-sm text-red-500">{errors.correct}</p>}
      </div>

      <button
        type="button"
        onClick={addChoice}
        disabled={choices.length >= 10 || isLoading}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed mb-4"
      >
        <Plus size={16} />
        Ajouter un choix (max 10)
      </button>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Points <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="1"
          max="100"
          value={points}
          onChange={(e) => {
            setPoints(parseInt(e.target.value) || 1);
            if (errors.points) setErrors(prev => ({ ...prev, points: null }));
          }}
          className={`w-24 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
            errors.points ? "border-red-500" : "border-gray-300"
          }`}
          disabled={isLoading}
        />
        {errors.points && <p className="mt-1 text-sm text-red-500">{errors.points}</p>}
      </div>

      {errors.submit && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {errors.submit}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? "Enregistrement..." : "Enregistrer la question"}
      </button>
    </div>
  );
}