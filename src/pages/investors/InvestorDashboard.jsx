import { useEffect, useState } from "react";
import { getAllFundingRequests, reviewFunding } from "../../services/funding";

export default function FundingRequests() {
  const [fundings, setFundings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [processing, setProcessing] = useState(null);

  const loadFundings = async () => {
    try {
      setLoading(true);
      const { data } = await getAllFundingRequests();
      const list = Array.isArray(data) ? data : (data.data || []);
      setFundings(list);
    } catch (err) {
      console.error("Erreur de chargement:", err);
      setMessage({ type: "error", text: "Erreur de chargement des demandes ❌" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFundings();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleDecision = async (id, status) => {
    try {
      setProcessing(id);
      await reviewFunding(id, { status });
      setMessage({ type: "success", text: `Projet ${status} avec succès ✅` });
      loadFundings();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Erreur lors de la mise à jour ❌" });
    } finally {
      setProcessing(null);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + " Ar";
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

  const pendingCount = fundings.filter(f => f.status === "en attente").length;
  const acceptedCount = fundings.filter(f => f.status === "accepté").length;
  const rejectedCount = fundings.filter(f => f.status === "refusé").length;
  const totalAmount = fundings.reduce((sum, f) => sum + (f.amount || 0), 0);
  const acceptedAmount = fundings.filter(f => f.status === "accepté").reduce((sum, f) => sum + (f.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Chargement des demandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            💰 Candidatures de Financement
          </h2>
          <p className="text-gray-600">Évaluez et gérez les demandes de financement</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-2xl shadow-lg animate-slide-down flex items-center gap-3 ${
            message.type === "success" 
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" 
              : "bg-gradient-to-r from-red-500 to-pink-500 text-white"
          }`}>
            <span className="text-2xl">{message.type === "success" ? "✅" : "❌"}</span>
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        {fundings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-fade-in">
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

            <div className="bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-lg border-2 border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-semibold uppercase">Montant Total</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{formatAmount(totalAmount)}</p>
                </div>
                <div className="text-5xl">💵</div>
              </div>
            </div>
          </div>
        )}

        {fundings.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-12 text-center shadow-lg animate-slide-up">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg font-medium">Aucune candidature pour le moment.</p>
            <p className="text-gray-500 text-sm mt-2">Les demandes de financement apparaîtront ici</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {fundings.map((f, index) => (
              <div
                key={f.id}
                className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`p-5 border-b-2 ${
                  f.status === "en attente" ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200" :
                  f.status === "accepté" ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" :
                  "bg-gradient-to-r from-red-50 to-pink-50 border-red-200"
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-800 mb-1">
                        {f.Project?.title || "Projet sans titre"}
                      </h3>
                      <p className="text-gray-600 flex items-center gap-2 text-sm">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Demande #{f.id}
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full border-2 font-semibold text-sm flex items-center gap-2 ${getStatusBadge(f.status)}`}>
                      <span>{getStatusIcon(f.status)}</span>
                      {f.status}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                      <p className="text-xs text-blue-600 uppercase font-semibold mb-2">📝 Description</p>
                      <p className="text-gray-700 leading-relaxed">{f.Project?.description || "Aucune description"}</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                      <p className="text-xs text-green-600 uppercase font-semibold mb-2">💰 Montant Demandé</p>
                      <p className="text-3xl font-bold text-green-700">{formatAmount(f.amount)}</p>
                    </div>
                  </div>

                  {f.status === "en attente" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDecision(f.id, "accepté")}
                        disabled={processing === f.id}
                        className={`flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                          processing === f.id
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:scale-105 active:scale-95"
                        }`}
                      >
                        {processing === f.id ? (
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
                        onClick={() => handleDecision(f.id, "refusé")}
                        disabled={processing === f.id}
                        className={`flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                          processing === f.id
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:from-red-600 hover:to-pink-600 hover:shadow-xl hover:scale-105 active:scale-95"
                        }`}
                      >
                        {processing === f.id ? (
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

                  {f.status !== "en attente" && (
                    <div className={`text-center py-3 px-4 rounded-xl font-semibold ${
                      f.status === "accepté"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {f.status === "accepté" ? (
                        <span className="flex items-center justify-center gap-2">
                          <span>✅</span>
                          Demande acceptée - Montant approuvé : {formatAmount(f.amount)}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <span>❌</span>
                          Demande refusée
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {acceptedCount > 0 && (
          <div className="mt-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-2xl shadow-lg animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-semibold uppercase">Total Financé</p>
                <p className="text-3xl font-bold mt-1">{formatAmount(acceptedAmount)}</p>
              </div>
              <div className="text-6xl opacity-80">💎</div>
            </div>
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