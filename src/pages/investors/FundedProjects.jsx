import { useEffect, useState } from "react";
import { getFundedProjects } from "../../services/funding";

export default function FundedProjects() {
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getFundedProjects()
      .then((res) => {
        if (res.data.message) setMessage(res.data.message);
        else setProjects(res.data);
      })
      .catch(() => setMessage("Erreur de chargement ❌"));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📊 Projets Financé(s)</h2>

      {message && <p className="text-gray-600">{message}</p>}

      {projects.length > 0 && (
        <div className="grid gap-4">
          {projects.map((item) => (
            <div key={item.id} className="border p-4 rounded-lg bg-gray-50 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">
                {item.Project?.title} — {item.Project?.User?.name}
              </h3>
              <p><strong>Email :</strong> {item.Project?.User?.email}</p>
              <p><strong>Description :</strong> {item.Project?.description}</p>
              <p><strong>Montant financé :</strong> {item.amount} Ar</p>
              <p><strong>Progression :</strong> {item.Project?.progress}%</p>
              <p><strong>Statut :</strong> {item.Project?.status}</p>

              <div className="w-full bg-gray-300 rounded h-3 mt-3">
                <div
                  className={`h-3 rounded ${
                    item.Project?.progress < 30
                      ? "bg-red-500"
                      : item.Project?.progress < 70
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${item.Project?.progress || 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
