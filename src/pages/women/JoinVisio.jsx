import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { joinVisio, getMyVisios } from "../../services/visio";

export default function JoinVisio() {
  const [visios, setVisios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadVisios();
    // Rafraîchir toutes les 30 secondes pour voir les nouvelles visios
    const interval = setInterval(loadVisios, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadVisios = async () => {
    try {
      const { data } = await getMyVisios();
      setVisios(data);
      setLoading(false);
    } catch (err) {
      setMessage("Erreur lors du chargement des sessions ❌");
      setLoading(false);
    }
  };

  const handleJoin = async (sessionId) => {
    try {
      const { data } = await joinVisio(sessionId);
      // Ouvrir directement le lien Jitsi dans un nouvel onglet
      window.open(data.link, '_blank');
      setMessage("Session ouverte dans un nouvel onglet ✅");
    } catch (err) {
      setMessage(err.response?.data?.message || "Session introuvable ou non autorisée ❌");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      "planifiée": "bg-blue-100 text-blue-800",
      "en cours": "bg-green-100 text-green-800 animate-pulse",
      "terminée": "bg-gray-100 text-gray-800",
      "annulée": "bg-red-100 text-red-800"
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || "bg-gray-100"}`}>
        {status}
      </span>
    );
  };

  const isSessionReady = (scheduledAt) => {
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    const diff = (scheduled - now) / (1000 * 60); // différence en minutes
    return diff <= 15 && diff >= -30; // 15 min avant jusqu'à 30 min après
  };

  const getTimeInfo = (scheduledAt) => {
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    const diff = Math.floor((scheduled - now) / (1000 * 60));
    
    if (diff > 0) {
      return `Dans ${diff} min`;
    } else if (diff >= -30) {
      return `En cours`;
    } else {
      return `Terminée`;
    }
  };

  // Filtrer et trier les visios
  const upcomingVisios = visios
    .filter(v => v.status !== "annulée" && v.status !== "terminée")
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  const readyToJoin = upcomingVisios.filter(v => isSessionReady(v.scheduledAt));

  if (loading) {
    return <div className="p-6 text-center">Chargement...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">🎥 Mes Sessions Visio</h2>

      {/* Notifications des sessions prêtes */}
      {readyToJoin.length > 0 && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <div className="flex items-center mb-2">
            <span className="text-green-800 font-semibold">
              🔔 {readyToJoin.length} session(s) prête(s) à rejoindre !
            </span>
          </div>
          <div className="space-y-2">
            {readyToJoin.map(visio => (
              <div key={visio.id} className="flex items-center justify-between bg-white p-3 rounded">
                <div>
                  <span className="font-medium">
                    {visio.mentor?.name || visio.femme?.name}
                  </span>
                  <span className="text-sm text-gray-600 ml-2">
                    {new Date(visio.scheduledAt).toLocaleString('fr-FR')}
                  </span>
                </div>
                <button
                  onClick={() => handleJoin(visio.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition"
                >
                  Rejoindre maintenant
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste de toutes les sessions à venir */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Sessions à venir</h3>
        </div>
        
        {upcomingVisios.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Aucune session programmée
          </div>
        ) : (
          <div className="divide-y">
            {upcomingVisios.map(visio => {
              const ready = isSessionReady(visio.scheduledAt);
              return (
                <div key={visio.id} className={`p-4 ${ready ? 'bg-green-50' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(visio.status)}
                        <span className="text-sm font-medium text-gray-600">
                          {getTimeInfo(visio.scheduledAt)}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="font-medium text-lg">
                          {visio.mentor?.name} ↔️ {visio.femme?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          📅 {new Date(visio.scheduledAt).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          🕐 {new Date(visio.scheduledAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {visio.femme?.email && (
                          <p className="text-sm text-gray-500">
                            📧 {visio.femme.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      {ready ? (
                        <button
                          onClick={() => handleJoin(visio.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
                        >
                          Rejoindre
                        </button>
                      ) : (
                        <button
                          disabled
                          className="bg-gray-300 text-gray-600 px-6 py-2 rounded-lg font-medium cursor-not-allowed"
                        >
                          Pas encore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sessions passées / annulées */}
      {visios.filter(v => v.status === "terminée" || v.status === "annulée").length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-600">Historique</h3>
          </div>
          <div className="divide-y max-h-64 overflow-y-auto">
            {visios
              .filter(v => v.status === "terminée" || v.status === "annulée")
              .slice(0, 5)
              .map(visio => (
                <div key={visio.id} className="p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <div>
                      {getStatusBadge(visio.status)}
                      <span className="ml-3 text-sm">
                        {visio.mentor?.name} ↔️ {visio.femme?.name}
                      </span>
                      <span className="ml-3 text-sm text-gray-500">
                        {new Date(visio.scheduledAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  {visio.cancelReason && (
                    <p className="text-sm text-red-600 mt-1">
                      Raison: {visio.cancelReason}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {message && (
        <div className="mt-4 p-3 bg-red-50 text-red-800 rounded">
          {message}
        </div>
      )}
    </div>
  );
}