import { useAuth } from "../../hooks/useAuth";

export default function Sessions() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📅 Sessions de mentorat - {user?.name}</h1>
      <p>Ici, tu pourras planifier et suivre tes sessions de mentorat.</p>
      <ul className="list-disc pl-6 mt-3">
        <li>Planifier une session de visioconférence</li>
        <li>Suivre l’avancement des mentorés</li>
        <li>Consulter l’historique des sessions</li>
      </ul>
      <p className="mt-3 text-gray-600">
        (👉 À connecter plus tard avec Zoom/Google Meet ou un module calendrier)
      </p>
    </div>
  );
}
