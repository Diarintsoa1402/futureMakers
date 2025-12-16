import { useEffect, useState } from "react";
import { getAllMentorshipRequests, reviewMentorship } from "../../services/mentorship";

export default function MentorshipRequests() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAllMentorshipRequests();
      setRequests(data);
    } catch (error) {
      console.error("Erreur de chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDecision = async (id, status) => {
    setProcessing(id);
    try {
      await reviewMentorship(id, { status });
      setMessage(`Demande ${status} ✅`);
      setTimeout(() => setMessage(""), 3000);
      await load();
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      "en attente": "bg-yellow-100 text-yellow-700 border-yellow-300",
      "accepté": "bg-green-100 text-green-700 border-green-300",
      "refusé": "bg-red-100 text-red-700 border-red-300"
    };
    return badges[status] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getStatusIcon = (status) => {
    const icons = {
      "en attente": "⏳",
      "accepté": "✅",
      "refusé": "❌"
    };
    return icons[status] || "📋";
  };

  const pendingCount = requests.filter(r => r.status === "en attente").length;
  const acceptedCount = requests.filter(r => r.status === "accepté").length;
  const rejectedCount = requests.filter(r => r.status === "refusé").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Chargement des demandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📋 Demandes de Mentorat
          </h2>
          <p className="text-gray-600">Gérez les demandes de mentorat</p>
        </div>

        {message && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-2xl mb-6 shadow-lg animate-slide-down flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <span className="font-semibold">{message}</span>
          </div>
        )}

        {requests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in">
            <div className="bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-lg border-2 border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-semibold uppercase">En Attente</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{pendingCount}</p>
                </div>
                <div className="text-5xl">⏳</div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-lg border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-semibold uppercase">Acceptées</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{acceptedCount}</p>
                </div>
                <div className="text-5xl">✅</div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-lg border-2 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-semibold uppercase">Refusées</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{rejectedCount}</p>
                </div>
                <div className="text-5xl">❌</div>
              </div>
            </div>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-12 text-center shadow-lg animate-slide-up">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg font-medium">Aucune demande pour le moment.</p>
            <p className="text-gray-500 text-sm mt-2">Les demandes de mentorat apparaîtront ici</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {requests.map((r, index) => (
              <div
                key={r.id}
                className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`p-5 border-b-2 ${
                  r.status === "en attente" ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200" :
                  r.status === "accepté" ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" :
                  "bg-gradient-to-r from-red-50 to-pink-50 border-red-200"
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-800 mb-1">
                        {r.femme?.name || "Nom non disponible"}
                      </h3>
                      <p className="text-gray-600 flex items-center gap-2 text-sm">
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        {r.femme?.email || "Email non disponible"}
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full border-2 font-semibold text-sm flex items-center gap-2 ${getStatusBadge(r.status)}`}>
                      <span>{getStatusIcon(r.status)}</span>
                      {r.status}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 mb-4">
                    <p className="text-xs text-blue-600 uppercase font-semibold mb-2">💬 Message</p>
                    <p className="text-gray-700 leading-relaxed">{r.message || "Aucun message"}</p>
                  </div>

                  {r.status === "en attente" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDecision(r.id, "accepté")}
                        disabled={processing === r.id}
                        className={`flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                          processing === r.id
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:scale-105 active:scale-95"
                        }`}
                      >
                        {processing === r.id ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            <span>Traitement...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xl">✅</span>
                            <span>Accepter</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDecision(r.id, "refusé")}
                        disabled={processing === r.id}
                        className={`flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                          processing === r.id
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:from-red-600 hover:to-pink-600 hover:shadow-xl hover:scale-105 active:scale-95"
                        }`}
                      >
                        {processing === r.id ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            <span>Traitement...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xl">❌</span>
                            <span>Refuser</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {r.status !== "en attente" && (
                    <div className={`text-center py-3 px-4 rounded-xl font-semibold ${
                      r.status === "accepté"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {r.status === "accepté" ? "✅ Demande acceptée" : "❌ Demande refusée"}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out backwards;
        }

        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}