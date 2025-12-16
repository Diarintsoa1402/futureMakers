// frontend/src/pages/admin/FormationEdit.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getAllFormations, 
  updateFormation, 
  addModule, 
  updateModule, 
  deleteModule 
} from "../../services/formationService";

export default function FormationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  // États formation
  const [formation, setFormation] = useState({
    title: "",
    description: "",
    category: "entrepreneuriat",
    level: "débutant",
    duration: 0,
    imageUrl: "",
    objectives: "",
    requirements: "",
    maxParticipants: 50
  });

  // États modules
  const [modules, setModules] = useState([]);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    contentType: "video",
    contentUrl: "",
    duration: 0,
    orderIndex: 1
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Charger la formation
  useEffect(() => {
    loadFormation();
  }, [id]);

  const loadFormation = async () => {
    try {
      setLoading(true);
      const { data } = await getAllFormations();
      const found = data.formations.find((f) => f.id === parseInt(id));

      if (!found) {
        setError("Formation introuvable");
        return;
      }

      setFormation({
        title: found.title,
        description: found.description,
        category: found.category,
        level: found.level,
        duration: found.duration,
        imageUrl: found.imageUrl || "",
        objectives: found.objectives || "",
        requirements: found.requirements || "",
        maxParticipants: found.maxParticipants
      });

      setModules(found.modules || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement");
      setLoading(false);
    }
  };

  // Mettre à jour formation
  const handleUpdateFormation = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await updateFormation(id, formation);
      setSuccess("Formation mise à jour avec succès !");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  // Ajouter module
  const handleAddModule = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await addModule(id, moduleForm);
      setSuccess("Module ajouté avec succès !");
      setShowModuleForm(false);
      resetModuleForm();
      loadFormation(); // Recharger
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de l'ajout du module");
    }
  };

  // Modifier module
  const handleUpdateModule = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await updateModule(editingModule.id, moduleForm);
      setSuccess("Module modifié avec succès !");
      setEditingModule(null);
      setShowModuleForm(false);
      resetModuleForm();
      loadFormation();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de la modification");
    }
  };

  // Supprimer module
  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm("Supprimer ce module ?")) return;
    try {
      setError(null);
      await deleteModule(moduleId);
      setSuccess("Module supprimé avec succès !");
      loadFormation();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  // Éditer module existant
  const startEditModule = (module) => {
    setEditingModule(module);
    setModuleForm({
      title: module.title,
      description: module.description || "",
      contentType: module.contentType,
      contentUrl: module.contentUrl || "",
      duration: module.duration || 0,
      orderIndex: module.orderIndex
    });
    setShowModuleForm(true);
  };

  // Reset form module
  const resetModuleForm = () => {
    setModuleForm({
      title: "",
      description: "",
      contentType: "video",
      contentUrl: "",
      duration: 0,
      orderIndex: modules.length + 1
    });
  };

  const cancelModuleForm = () => {
    setShowModuleForm(false);
    setEditingModule(null);
    resetModuleForm();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Modifier Formation</h1>
        <button
          onClick={() => navigate("/admin/formations")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ← Retour
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded border border-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded border border-green-300">
          {success}
        </div>
      )}

      {/* ========== FORMULAIRE FORMATION ========== */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Informations générales</h2>
        <form onSubmit={handleUpdateFormation} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre *
            </label>
            <input
              type="text"
              required
              value={formation.title}
              onChange={(e) => setFormation({ ...formation, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: Formation en Marketing Digital"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formation.description}
              onChange={(e) => setFormation({ ...formation, description: e.target.value })}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              placeholder="Décrivez cette formation..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie *
              </label>
              <select
                required
                value={formation.category}
                onChange={(e) => setFormation({ ...formation, category: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Niveau *
              </label>
              <select
                required
                value={formation.level}
                onChange={(e) => setFormation({ ...formation, level: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              >
                <option value="débutant">Débutant</option>
                <option value="intermédiaire">Intermédiaire</option>
                <option value="avancé">Avancé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durée (heures) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formation.duration}
                onChange={(e) => setFormation({ ...formation, duration: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Image
              </label>
              <input
                type="url"
                value={formation.imageUrl}
                onChange={(e) => setFormation({ ...formation, imageUrl: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Participants
              </label>
              <input
                type="number"
                min="1"
                value={formation.maxParticipants}
                onChange={(e) => setFormation({ ...formation, maxParticipants: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objectifs (un par ligne)
            </label>
            <textarea
              value={formation.objectives}
              onChange={(e) => setFormation({ ...formation, objectives: e.target.value })}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              placeholder="Objectif 1&#10;Objectif 2&#10;Objectif 3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prérequis (un par ligne)
            </label>
            <textarea
              value={formation.requirements}
              onChange={(e) => setFormation({ ...formation, requirements: e.target.value })}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              placeholder="Prérequis 1&#10;Prérequis 2"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium"
          >
            💾 Enregistrer les modifications
          </button>
        </form>
      </div>

      {/* ========== MODULES ========== */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700">
            Modules ({modules.length})
          </h2>
          {!showModuleForm && (
            <button
              onClick={() => {
                resetModuleForm();
                setShowModuleForm(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              + Ajouter Module
            </button>
          )}
        </div>

        {/* Formulaire Module */}
        {showModuleForm && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded">
            <h3 className="font-semibold mb-3 text-gray-700">
              {editingModule ? "Modifier Module" : "Nouveau Module"}
            </h3>
            <form onSubmit={editingModule ? handleUpdateModule : handleAddModule} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Titre du module *"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
              />

              <textarea
                placeholder="Description"
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                rows="2"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={moduleForm.contentType}
                  onChange={(e) => setModuleForm({ ...moduleForm, contentType: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="video">Vidéo</option>
                  <option value="pdf">PDF</option>
                  <option value="article">Article</option>
                  <option value="quiz">Quiz</option>
                </select>

                <input
                  type="number"
                  placeholder="Durée (min)"
                  value={moduleForm.duration}
                  onChange={(e) => setModuleForm({ ...moduleForm, duration: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                />

                <input
                  type="number"
                  placeholder="Ordre"
                  value={moduleForm.orderIndex}
                  onChange={(e) => setModuleForm({ ...moduleForm, orderIndex: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <input
                type="url"
                placeholder="URL du contenu"
                value={moduleForm.contentUrl}
                onChange={(e) => setModuleForm({ ...moduleForm, contentUrl: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {editingModule ? "💾 Modifier" : "✅ Ajouter"}
                </button>
                <button
                  type="button"
                  onClick={cancelModuleForm}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste Modules */}
        {modules.length > 0 ? (
          <div className="space-y-3">
            {modules.sort((a, b) => a.orderIndex - b.orderIndex).map((module) => (
              <div
                key={module.id}
                className="p-4 border border-gray-200 rounded hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded font-medium">
                        #{module.orderIndex}
                      </span>
                      <h4 className="font-semibold text-gray-800">{module.title}</h4>
                    </div>
                    {module.description && (
                      <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                    )}
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>📄 {module.contentType}</span>
                      {module.duration && <span>⏱️ {module.duration} min</span>}
                    </div>
                    {module.contentUrl && (
                      <a
                        href={module.contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
                      >
                        🔗 Voir le contenu
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => startEditModule(module)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Aucun module pour cette formation
          </p>
        )}
      </div>
    </div>
  );
}
