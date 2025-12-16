
// =============================================================================
// MenteesProjects.jsx
import { useEffect, useState } from "react";
import { getMenteesProjects } from "../../services/mentor";
import { Target, Mail, DollarSign, TrendingUp, BarChart3, Search, Filter, Calendar } from "lucide-react";

function StatsCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function MenteesProjects() {
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    getMenteesProjects()
      .then((res) => {
        if (res.data.message) setMessage(res.data.message);
        else setProjects(res.data);
      })
      .catch(() => setMessage("Erreur de chargement ❌"))
      .finally(() => setLoading(false));
  }, []);

  const filteredProjects = projects.filter(item => {
    const matchSearch = item.femme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.femme.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (item.project && item.project.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchFilter = filterStatus === "all" ||
                       (filterStatus === "with" && item.project) ||
                       (filterStatus === "without" && !item.project);
    return matchSearch && matchFilter;
  });

  const totalProjects = projects.filter(p => p.project).length;
  const totalFunding = projects.reduce((sum, p) => sum + (p.project?.fundingReceived || 0), 0);
  const avgProgress = totalProjects > 0
    ? Math.round(projects.filter(p => p.project).reduce((sum, p) => sum + p.project.progress, 0) / totalProjects)
    : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MG', { style: 'decimal' }).format(amount) + ' Ar';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Target className="w-10 h-10 text-blue-600" />
            Projets des Mentorées
          </h1>
          <p className="text-gray-600">Suivi des projets et financements</p>
        </div>

        {/* Statistiques */}
        {projects.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatsCard 
              icon={BarChart3} 
              label="Projets Actifs" 
              value={totalProjects}
              color="bg-blue-500"
            />
            <StatsCard 
              icon={DollarSign} 
              label="Fonds Reçus Total" 
              value={formatCurrency(totalFunding)}
              color="bg-green-500"
            />
            <StatsCard 
              icon={TrendingUp} 
              label="Progression Moyenne" 
              value={`${avgProgress}%`}
              color="bg-purple-500"
            />
          </div>
        )}

        {/* Filtres */}
        {projects.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou projet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous</option>
                  <option value="with">Avec projet</option>
                  <option value="without">Sans projet</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Message ou chargement */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Chargement...</p>
          </div>
        )}

        {message && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <Target className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <p className="text-blue-700">{message}</p>
          </div>
        )}

        {/* Liste des projets */}
        {filteredProjects.length > 0 && (
          <div className="grid gap-6">
            {filteredProjects.map((item, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Info Femme */}
                  <div className="md:w-1/4 pb-6 md:pb-0 md:pr-6 md:border-r border-b md:border-b-0 border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {item.femme.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 truncate">{item.femme.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.femme.email}</span>
                    </div>
                  </div>

                  {/* Info Projet */}
                  <div className="flex-1">
                    {item.project ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-2xl font-bold text-gray-900 mb-2">{item.project.title}</h4>
                          <p className="text-gray-600">{item.project.description}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm text-blue-600 font-medium mb-1">Montant Demandé</p>
                            <p className="text-xl font-bold text-blue-900">{formatCurrency(item.project.fundingRequested)}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-sm text-green-600 font-medium mb-1">Montant Reçu</p>
                            <p className="text-xl font-bold text-green-900">{formatCurrency(item.project.fundingReceived)}</p>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Progression du Projet</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                              item.project.progress < 30 ? "bg-red-100 text-red-700" :
                              item.project.progress < 70 ? "bg-yellow-100 text-yellow-700" :
                              "bg-green-100 text-green-700"
                            }`}>
                              {item.project.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                item.project.progress < 30 ? "bg-gradient-to-r from-red-500 to-red-600" :
                                item.project.progress < 70 ? "bg-gradient-to-r from-yellow-500 to-yellow-600" :
                                "bg-gradient-to-r from-green-500 to-green-600"
                              }`}
                              style={{ width: `${item.project.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            item.project.status === "en_cours" ? "bg-blue-100 text-blue-700" :
                            item.project.status === "terminé" ? "bg-green-100 text-green-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {item.project.status === "en_cours" ? "En cours" : 
                             item.project.status === "terminé" ? "Terminé" : item.project.status}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg p-8">
                        <div className="text-center">
                          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">Aucun projet enregistré</p>
                          <p className="text-sm text-gray-400 mt-1">Cette mentorée n'a pas encore créé de projet</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProjects.length === 0 && projects.length > 0 && !loading && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Aucun résultat trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}