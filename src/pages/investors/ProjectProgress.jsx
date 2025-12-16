import { useEffect, useState } from "react";
import { getProjectsProgress } from "../../services/project";

export default function ProjectProgress() {
  const [projects, setProjects] = useState([]);

  useEffect(() => { load(); }, []);
  const load = async () => {
    const res = await getProjectsProgress();
    setProjects(res.data);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Suivi des projets</h1>
      {projects.length === 0 ? (
        <p>Aucun projet.</p>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li key={p.id} className="border p-4 rounded shadow">
              <h3 className="font-semibold">{p.title}</h3>
              <p>Status: {p.status}</p>
              <p>Financement reçu: {p.raisedFunding || 0} / {p.targetFunding} $</p>
              <p>Progression mentorat: {p.Mentorships?.[0]?.progress || "N/A"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
