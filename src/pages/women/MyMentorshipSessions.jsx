import { useEffect, useState } from "react";
import { getMySessions } from "../../services/mentorshipSession";

export default function MyMentorshipSessions() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    getMySessions().then((res) => setSessions(res.data));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">🤝 Mes sessions de mentorat</h2>
      {sessions.length === 0 ? (
        <p>Aucune session planifiée.</p>
      ) : (
        <div className="grid gap-4">
          {sessions.map((s) => (
            <div key={s.id} className="border rounded p-4 bg-gray-50 shadow-sm">
              <p><strong>Mentor :</strong> {s.mentor?.name}</p>
              <p><strong>Thème :</strong> {s.theme}</p>
              <p><strong>Date :</strong> {new Date(s.date).toLocaleString()}</p>
              <p><strong>Statut :</strong> {s.status}</p>
              {s.notes && <p><strong>Compte rendu :</strong> {s.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
