import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function ProjectsToFund() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [amount, setAmount] = useState("");

  // Charger la liste des projets à financer
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        setProjects(res.data);
      } catch (err) {
        console.error("Erreur chargement projets", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Fonction pour financer un projet
  const handleFunding = async (e) => {
    e.preventDefault();
    if (!selectedProject || !amount) return;

    try {
      await api.post("/fundings", {
        projectId: selectedProject.id,
        amount: parseFloat(amount),
      });
      alert("✅ Financement effectué avec succès !");
      setAmount("");
      setSelectedProject(null);
    } catch (err) {
      console.error("Erreur financement projet", err);
      alert("❌ Erreur lors du financement.");
    }
  };

  if (loading) return <p>Chargement des projets...</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">💵 Projets disponibles</h1>

      <ul className="space-y-4">
        {projects.map((p) => (
          <li
            key={p.id}
            className="border p-4 rounded-lg shadow-sm bg-white flex justify-between items-center"
          >
            <div>
              <h2 className="font-semibold">{p.title}</h2>
              <p className="text-sm text-gray-600">{p.description}</p>
              <p className="text-sm mt-1">
                🎯 Objectif: <b>{p.targetFunding} $</b> | Reçu:{" "}
                <b>{p.raisedFunding || 0} $</b>
              </p>
            </div>
            <button
              onClick={() => setSelectedProject(p)}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Financer
            </button>
          </li>
        ))}
      </ul>

      {/* Formulaire financement */}
      {selectedProject && (
        <form
          onSubmit={handleFunding}
          className="mt-6 p-4 border rounded bg-gray-50 shadow"
        >
          <h3 className="font-semibold mb-2">
            Financer le projet : {selectedProject.title}
          </h3>
          <input
            type="number"
            placeholder="Montant en $"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 rounded w-full mb-3"
            required
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Confirmer
            </button>
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
