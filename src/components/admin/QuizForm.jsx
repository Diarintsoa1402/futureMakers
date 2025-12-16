// frontend/src/components/admin/QuizForm.jsx
import { useState } from "react";

export default function QuizForm({ onSubmit, initialData = null, isLoading = false }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || ""
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Le titre est requis";
    if (formData.title.length > 200) newErrors.title = "Le titre est trop long (max 200 caractères)";
    if (formData.description.length > 1000) newErrors.description = "La description est trop longue (max 1000 caractères)";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Titre du quiz <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Ex: Quiz de mathématiques niveau 1"
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
          disabled={isLoading}
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Décrivez le contenu du quiz..."
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          disabled={isLoading}
        />
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? "Enregistrement..." : initialData ? "Modifier le quiz" : "Créer le quiz"}
      </button>
    </form>
  );
}