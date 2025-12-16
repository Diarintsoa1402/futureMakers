
// MyMentees.jsx
import { useEffect, useState } from "react";
import { getMyMentees } from "../../services/mentor";
import { Users, Mail, TrendingUp, Award, Search, Filter } from "lucide-react";

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

export default function MyMentees() {
  const [mentees, setMentees] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProgress, setFilterProgress] = useState("all");

  useEffect(() => {
    getMyMentees()
      .then((res) => {
        if (res.data.message) setMessage(res.data.message);
        else setMentees(res.data);
      })
      .catch(() => setMessage("Erreur de chargement ❌"))
      .finally(() => setLoading(false));
  }, []);

  const filteredMentees = mentees.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterProgress === "all" ||
                       (filterProgress === "low" && m.progress < 30) ||
                       (filterProgress === "medium" && m.progress >= 30 && m.progress < 70) ||
                       (filterProgress === "high" && m.progress >= 70);
    return matchSearch && matchFilter;
  });

  const avgProgress = mentees.length > 0 
    ? Math.round(mentees.reduce((sum, m) => sum + m.progress, 0) / mentees.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-purple-600" />
            Mes Mentorées
          </h1>
          <p className="text-gray-600">Suivez la progression de vos mentorées</p>
        </div>

        {/* Statistiques */}
        {mentees.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatsCard 
              icon={Users} 
              label="Total Mentorées" 
              value={mentees.length}
              color="bg-purple-500"
            />
            <StatsCard 
              icon={TrendingUp} 
              label="Progression Moyenne" 
              value={`${avgProgress}%`}
              color="bg-blue-500"
            />
            <StatsCard 
              icon={Award} 
              label="Sessions Actives" 
              value={mentees.filter(m => m.progress > 0).length}
              color="bg-green-500"
            />
          </div>
        )}

        {/* Filtres */}
        {mentees.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterProgress}
                  onChange={(e) => setFilterProgress(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Toutes</option>
                  <option value="low">Débutante (&lt;30%)</option>
                  <option value="medium">En cours (30-70%)</option>
                  <option value="high">Avancée (&gt;70%)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Message ou chargement */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Chargement...</p>
          </div>
        )}

        {message && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <Users className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <p className="text-blue-700">{message}</p>
          </div>
        )}

        {/* Liste des mentorées */}
        {filteredMentees.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredMentees.map((f) => (
              <div key={f.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {f.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{f.name}</h3>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm truncate">{f.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ml-2 flex-shrink-0 ${
                    f.progress < 30 ? "bg-red-100 text-red-700" :
                    f.progress < 70 ? "bg-yellow-100 text-yellow-700" :
                    "bg-green-100 text-green-700"
                  }`}>
                    {f.progress}%
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Progression</span>
                    <span className="text-gray-900 font-bold">{f.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        f.progress < 30 ? "bg-gradient-to-r from-red-500 to-red-600" :
                        f.progress < 70 ? "bg-gradient-to-r from-yellow-500 to-yellow-600" :
                        "bg-gradient-to-r from-green-500 to-green-600"
                      }`}
                      style={{ width: `${f.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredMentees.length === 0 && mentees.length > 0 && !loading && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Aucun résultat trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
