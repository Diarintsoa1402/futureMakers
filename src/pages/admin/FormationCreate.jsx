// frontend/src/pages/admin/FormationCreate.jsx
import React, { useState } from "react";
import { createFormation, addModule } from "../../services/formationService";
import { useNavigate } from "react-router-dom";

export default function FormationCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=Info, 2=Modules
  const [formationId, setFormationId] = useState(null);
  const [error, setError] = useState(null);

  // Étape 1 : Info formation
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "entrepreneuriat",
    level: "débutant",
    duration: "",
    maxParticipants: 50,
    imageUrl: "",
    objectives: [""],
    requirements: [""]
  });

  // Étape 2 : Modules
  const [modules, setModules] = useState([
    { title: "", description: "", contentType: "document", contentUrl: "", duration: "", orderIndex: 0 }
  ]);

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleArrayChange = (field, index, value) => {
    const arr = [...formData[field]];
    arr[index] = value;
    setFormData({ ...formData, [field]: arr });
  };

  const addArrayField = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const removeArrayField = (field, index) => {
    const arr = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: arr });
  };

  const handleModuleChange = (index, field, value) => {
    const updated = [...modules];
    updated[index][field] = value;
    setModules(updated);
  };

  const addModuleField = () => {
    setModules([...modules, { 
      title: "", 
      description: "", 
      contentType: "document", 
      contentUrl: "", 
      duration: "", 
      orderIndex: modules.length 
    }]);
  };

  const removeModuleField = (index) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const submitStep1 = async (e) => {
    e.preventDefault();
    try {
      // Filtrer les champs vides
      const cleanData = {
        ...formData,
        objectives: formData.objectives.filter(o => o.trim()),
        requirements: formData.requirements.filter(r => r.trim())
      };

      const { data } = await createFormation(cleanData);
      setFormationId(data.formation.id);
      setStep(2);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur création");
    }
  };

  const submitStep2 = async (e) => {
    e.preventDefault();
    try {
      // Enregistrer chaque module
      for (let module of modules) {
        if (module.title.trim()) {
          await addModule(formationId, module);
        }
      }
      alert("Formation créée avec succès !");
      navigate("/admin/formations");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur ajout modules");
    }
  };

  const skipModules = () => {
    navigate("/admin/formations");
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Créer une Formation {step === 2 && "- Ajouter Modules"}
      </h1>

      {/* ÉTAPE 1 : Informations */}
      {step === 1 && (
        <form onSubmit={submitStep1} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block font-medium mb-1">Titre *</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={e => handleFormChange("title", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Ex: Entrepreneuriat pour Femmes"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => handleFormChange("description", e.target.value)}
              className="w-full p-2 border rounded"
              rows="3"
              placeholder="Décrivez la formation..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Catégorie</label>
              <select
                value={formData.category}
                onChange={e => handleFormChange("category", e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="entrepreneuriat">Entrepreneuriat</option>
                <option value="marketing">Marketing</option>
                <option value="finance">Finance</option>
                <option value="leadership">Leadership</option>
                <option value="technologie">Technologie</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Niveau</label>
              <select
                value={formData.level}
                onChange={e => handleFormChange("level", e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="débutant">Débutant</option>
                <option value="intermédiaire">Intermédiaire</option>
                <option value="avancé">Avancé</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Durée (heures) *</label>
              <input
                required
                type="number"
                value={formData.duration}
                onChange={e => handleFormChange("duration", e.target.value)}
                className="w-full p-2 border rounded"
                min="1"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Max participants</label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={e => handleFormChange("maxParticipants", e.target.value)}
                className="w-full p-2 border rounded"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">URL Image</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={e => handleFormChange("imageUrl", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="https://..."
            />
          </div>

          {/* Objectifs */}
          <div>
            <label className="block font-medium mb-1">Objectifs</label>
            {formData.objectives.map((obj, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={obj}
                  onChange={e => handleArrayChange("objectives", idx, e.target.value)}
                  className="flex-1 p-2 border rounded"
                  placeholder={`Objectif ${idx + 1}`}
                />
                {formData.objectives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField("objectives", idx)}
                    className="px-3 py-2 bg-red-500 text-white rounded"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField("objectives")}
              className="text-indigo-600 text-sm"
            >
              + Ajouter objectif
            </button>
          </div>

          {/* Prérequis */}
          <div>
            <label className="block font-medium mb-1">Prérequis</label>
            {formData.requirements.map((req, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={req}
                  onChange={e => handleArrayChange("requirements", idx, e.target.value)}
                  className="flex-1 p-2 border rounded"
                  placeholder={`Prérequis ${idx + 1}`}
                />
                {formData.requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField("requirements", idx)}
                    className="px-3 py-2 bg-red-500 text-white rounded"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField("requirements")}
              className="text-indigo-600 text-sm"
            >
              + Ajouter prérequis
            </button>
          </div>

          {error && <div className="text-red-600 p-3 bg-red-50 rounded">{error}</div>}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 font-medium"
          >
            Continuer → Ajouter Modules
          </button>
        </form>
      )}

      {/* ÉTAPE 2 : Modules */}
      {step === 2 && (
        <form onSubmit={submitStep2} className="space-y-4">
          <div className="bg-blue-50 p-4 rounded mb-4">
            <p className="text-sm text-blue-800">
              Formation créée ! Vous pouvez maintenant ajouter des modules (optionnel).
            </p>
          </div>

          {modules.map((module, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold">Module {idx + 1}</h3>
                {modules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeModuleField(idx)}
                    className="text-red-600 text-sm"
                  >
                    Supprimer
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={module.title}
                  onChange={e => handleModuleChange(idx, "title", e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Titre du module"
                />

                <textarea
                  value={module.description}
                  onChange={e => handleModuleChange(idx, "description", e.target.value)}
                  className="w-full p-2 border rounded"
                  rows="2"
                  placeholder="Description"
                />

                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={module.contentType}
                    onChange={e => handleModuleChange(idx, "contentType", e.target.value)}
                    className="p-2 border rounded"
                  >
                    <option value="video">Vidéo</option>
                    <option value="document">Document</option>
                    <option value="quiz">Quiz</option>
                    <option value="exercise">Exercice</option>
                    <option value="live">Live</option>
                  </select>

                  <input
                    type="number"
                    value={module.duration}
                    onChange={e => handleModuleChange(idx, "duration", e.target.value)}
                    className="p-2 border rounded"
                    placeholder="Durée (min)"
                  />

                  <input
                    type="number"
                    value={module.orderIndex}
                    onChange={e => handleModuleChange(idx, "orderIndex", e.target.value)}
                    className="p-2 border rounded"
                    placeholder="Ordre"
                  />
                </div>

                <input
                  type="url"
                  value={module.contentUrl}
                  onChange={e => handleModuleChange(idx, "contentUrl", e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="URL du contenu"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addModuleField}
            className="w-full border-2 border-dashed border-gray-300 p-3 rounded text-gray-600 hover:border-indigo-500 hover:text-indigo-600"
          >
            + Ajouter un module
          </button>

          {error && <div className="text-red-600 p-3 bg-red-50 rounded">{error}</div>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={skipModules}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded hover:bg-gray-400"
            >
              Terminer sans modules
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-3 rounded hover:bg-green-700 font-medium"
            >
              Enregistrer Modules
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
