// src/components/Mentorships/MentorshipList.js
import { useEffect, useState } from "react";
import { getMentorships, updateProgress } from "../../services/mentorship";

export default function MentorshipList() {
  const [mentorships, setMentorships] = useState([]);

  const loadMentorships = async () => {
    const res = await getMentorships();
    setMentorships(res.data);
  };

  useEffect(() => { loadMentorships(); }, []);

  const handleUpdate = async (id, progress, status) => {
    await updateProgress(id, { progress, status });
    await loadMentorships();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📊 Suivi des mentorats</h1>
      {mentorships.length === 0 ? (
        <p>Aucun mentorat pour le moment.</p>
      ) : (
        <ul>
          {mentorships.map((m) => (
            <li key={m.id} className="border p-3 rounded mb-2 shadow-sm bg-gray-50">
              <p><strong>Projet:</strong> {m.Project?.title}</p>
              <p><strong>Femme:</strong> {m.woman?.name}</p>
              <p><strong>Thème:</strong> {m.topic}</p>
              <p><strong>Date:</strong> {m.date?.slice(0,10)}</p>
              <p><strong>Notes:</strong> {m.notes}</p>
              <p><strong>Progression:</strong> {m.progress}</p>
              <p><strong>Status:</strong> {m.status}</p>

              <select onChange={(e) => handleUpdate(m.id, e.target.value, m.status)} defaultValue={m.progress}>
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Élevée</option>
              </select>
              <select onChange={(e) => handleUpdate(m.id, m.progress, e.target.value)} defaultValue={m.status}>
                <option value="Planifié">Planifié</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
              </select>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
