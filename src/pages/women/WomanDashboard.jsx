import { useEffect, useState } from "react";
import { getMyProjects } from "../../services/project";
import { getMyFundingApplications } from "../../services/funding";
import { getMyMentorships } from "../../services/mentorship";
import { getMyEnrollments } from "../../services/trainings";
import { useAuth } from "../../hooks/useAuth";

export default function WomanDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [fundings, setFundings] = useState([]);
  const [mentorships, setMentorships] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => { loadAll(); }, []);
  const loadAll = async () => {
    setProjects((await getMyProjects()).data);
    setFundings((await getMyFundingApplications()).data);
    setMentorships((await getMyMentorships()).data);
    setEnrollments((await getMyEnrollments()).data);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord — {user?.name}</h1>

      <section className="mb-6">
        <h2 className="font-semibold">Projets ({projects.length})</h2>
        {projects.map(p => <div key={p.id} className="border p-2 my-1"><strong>{p.title}</strong><div>{p.status}</div></div>)}
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">Candidatures financement ({fundings.length})</h2>
        {fundings.map(f => <div key={f.id} className="border p-2 my-1">{f.projectId} — {f.amountRequested}€ — {f.status}</div>)}
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">Sessions mentorat ({mentorships.length})</h2>
        {mentorships.map(m => <div key={m.id} className="border p-2 my-1">{m.topic} — {m.status}</div>)}
      </section>

      <section>
        <h2 className="font-semibold">Formations ({enrollments.length})</h2>
        {enrollments.map(e => <div key={e.id} className="border p-2 my-1">{e.Training?.title} — {e.status}</div>)}
      </section>
    </div>
  );
}
