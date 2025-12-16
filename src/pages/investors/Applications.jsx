import { useEffect, useState } from "react";
import { getFundingApplications } from "../../services/funding";

export default function Applications() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getFundingApplications();
    setApps(res.data);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📑 Candidatures au financement</h1>
      {apps.length === 0 ? (
        <p>Aucune candidature.</p>
      ) : (
        <ul className="space-y-3">
          {apps.map((a) => (
            <li key={a.id} className="border p-4 rounded shadow">
              <h3 className="font-semibold">{a.Project?.title}</h3>
              <p>👩 {a.woman?.name}</p>
              <p>💰 {a.amountRequested} $</p>
              <p>📝 {a.pitch}</p>
              <p>Status: {a.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
