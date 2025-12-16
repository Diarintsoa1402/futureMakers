// frontend/src/pages/admin/FormationList.jsx
import React, { useState, useEffect } from "react";
import { getAllFormations, deleteFormation } from "../../services/formationService";
import { useNavigate } from "react-router-dom";

export default function FormationList() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadFormations();
  }, []);

  const loadFormations = async () => {
    try {
      setLoading(true);
      const { data } = await getAllFormations();
      setFormations(data.formations || []);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette formation ?")) return;
    try {
      await deleteFormation(id);
      setFormations(formations.filter(f => f.id !== id));
      alert("Formation supprimée");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur suppression");
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Formations</h1>
        <button
          onClick={() => navigate("/admin/formations/create")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Créer Formation
        </button>
      </div>

      {formations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucune formation pour le moment
        </div>
      ) : (
        <div className="grid gap-4">
          {formations.map(formation => (
            <div key={formation.id} className="border rounded-lg p-4 bg-white shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{formation.title}</h3>
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                      {formation.category}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      {formation.level}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${formation.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {formation.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{formation.description}</p>
                  <div className="text-sm text-gray-500">
                    ⏱️ {formation.duration}h • 
                    📚 {formation.modules?.length || 0} modules • 
                    👥 {formation.enrollments?.length || 0} inscrites
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => navigate(`/admin/formations/${formation.id}/edit`)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(formation.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
