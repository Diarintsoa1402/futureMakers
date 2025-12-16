import { useAuth } from "../../hooks/useAuth";

export default function Reports() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Rapports - {user?.name}</h1>
      <p>Ici, l’administrateur peut consulter :</p>
      <ul className="list-disc pl-6">
        <li>📚 Nombre de cours suivis par les enfants</li>
        <li>💼 Nombre de projets créés par les femmes</li>
        <li>💰 Montant total financé par les investisseurs</li>
        <li>👩‍🏫 Sessions de mentorat actives</li>
      </ul>
      <p className="mt-3 text-gray-600">
        (👉 À connecter plus tard avec des endpoints de reporting + graphiques Recharts)
      </p>
    </div>
  );
}
