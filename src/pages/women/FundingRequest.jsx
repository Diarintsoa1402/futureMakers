import { useEffect, useState } from "react";
import { submitFunding } from "../../services/funding";
import { getMyProjects } from "../../services/project";
import { 
  DollarSign, 
  Briefcase, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Calendar,
  Tag,
  TrendingUp,
  Filter,
  Search,
  X
} from "lucide-react";

export default function FundingRequest() {
  const [form, setForm] = useState({ projectId: "", amount: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const selectProject = (projectId) => {
    setForm((prev) => ({ ...prev, projectId }));
    if (errors.projectId) setErrors((prev) => ({ ...prev, projectId: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.projectId || String(form.projectId).trim().length === 0) {
      newErrors.projectId = "Veuillez sélectionner un projet";
    }
    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = "Le montant doit être un nombre positif";
    } else if (amount < 10000) {
      newErrors.amount = "Le montant minimum est de 10 000 Ar";
    } else if (amount > 100000000) {
      newErrors.amount = "Le montant maximum est de 100 000 000 Ar";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) {
      setMessage({ type: "error", text: "Veuillez corriger les erreurs du formulaire" });
      return;
    }
    try {
      setSubmitting(true);
      const payload = { projectId: form.projectId, amount: parseFloat(form.amount) };
      const { data } = await submitFunding(payload);
      setMessage({ type: "success", text: data?.message || "Demande de financement envoyée avec succès !" });
      setForm({ projectId: "", amount: "" });
    } catch (err) {
      const msg = err?.response?.data?.message || "Erreur lors de l'envoi de la demande";
      setMessage({ type: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadingProjects(true);
        const { data } = await getMyProjects();
        const list = Array.isArray(data) ? data : (data.projects || []);
        setProjects(list);
        setFilteredProjects(list);
      } catch (err) {
        setProjectsError("Impossible de charger vos projets");
      } finally {
        setLoadingProjects(false);
      }
    };
    loadProjects();
  }, []);

  // Filtrer les projets
  useEffect(() => {
    let filtered = projects;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (filterStatus !== "all") {
      filtered = filtered.filter(project => project.status === filterStatus);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, filterStatus]);

  const getStatusConfig = (status) => {
    const configs = {
      "en cours": { 
        bg: "from-blue-500 to-cyan-500", 
        badge: "bg-blue-100 text-blue-800 border-blue-200",
        icon: "🔄"
      },
      "validé": { 
        bg: "from-emerald-500 to-green-500", 
        badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: "✅"
      },
      "refusé": { 
        bg: "from-rose-500 to-red-500", 
        badge: "bg-rose-100 text-rose-800 border-rose-200",
        icon: "❌"
      },
      "terminé": { 
        bg: "from-slate-500 to-gray-500", 
        badge: "bg-slate-100 text-slate-800 border-slate-200",
        icon: "🏁"
      },
      "pending": { 
        bg: "from-amber-500 to-orange-500", 
        badge: "bg-amber-100 text-amber-800 border-amber-200",
        icon: "⏳"
      },
      "approved": { 
        bg: "from-emerald-500 to-green-500", 
        badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: "✅"
      },
      "rejected": { 
        bg: "from-rose-500 to-red-500", 
        badge: "bg-rose-100 text-rose-800 border-rose-200",
        icon: "❌"
      },
      "draft": { 
        bg: "from-slate-500 to-gray-500", 
        badge: "bg-slate-100 text-slate-800 border-slate-200",
        icon: "📝"
      }
    };
    return configs[status?.toLowerCase()] || configs["en cours"];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MG').format(amount || 0);
  };

  const selectedProjectData = projects.find(p => p.id === form.projectId);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
  };

  const hasActiveFilters = searchTerm || filterStatus !== "all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg mb-4">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Demande de Financement
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Soumettez une demande de financement pour l'un de vos projets existants
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Liste des projets */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Vos Projets
                </h2>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Filtres et recherche */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un projet..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="en cours">En cours</option>
                  <option value="validé">Validé</option>
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvé</option>
                  <option value="draft">Brouillon</option>
                </select>

                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-2 px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-blue-200"
                  >
                    <X className="w-4 h-4" />
                    Réinitialiser
                  </button>
                )}
              </div>

              {/* Liste des projets */}
              {loadingProjects ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-100 border border-gray-200 rounded-xl p-4 animate-pulse">
                      <div className="h-4 bg-gray-300 rounded mb-3 w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded mb-2 w-1/2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : projectsError ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
                  <p className="text-rose-600 font-medium">{projectsError}</p>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {hasActiveFilters ? "Aucun projet trouvé" : "Aucun projet disponible"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {hasActiveFilters 
                      ? "Essayez de modifier vos critères de recherche" 
                      : "Créez d'abord un projet pour faire une demande de financement"
                    }
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Voir tous les projets
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => selectProject(project.id)}
                      className={`cursor-pointer transition-all duration-300 border-2 rounded-xl p-4 ${
                        form.projectId === project.id
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 flex-1">
                          {project.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusConfig(project.status).badge}`}>
                          {getStatusConfig(project.status).icon} {project.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {project.description || "Aucune description fournie"}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700 font-medium flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(project.fundingRequested)} Ar
                          </span>
                          {project.category && (
                            <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {project.category}
                            </span>
                          )}
                        </div>
                        
                        {project.createdAt && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Formulaire de demande */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Send className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Demande de Financement
                </h2>
              </div>

              {/* Message de statut */}
              {message.text && (
                <div className={`mb-6 p-4 rounded-xl border-2 ${
                  message.type === "success" 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}>
                  <div className="flex items-center gap-3">
                    {message.type === "success" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span className="font-medium">{message.text}</span>
                  </div>
                </div>
              )}

              {/* Projet sélectionné */}
              {selectedProjectData && (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-blue-900 text-sm">
                      Projet sélectionné
                    </h3>
                    <button
                      onClick={() => selectProject("")}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">{selectedProjectData.title}</p>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{formatCurrency(selectedProjectData.fundingRequested)} Ar</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusConfig(selectedProjectData.status).badge}`}>
                        {selectedProjectData.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Erreur sélection projet */}
              {errors.projectId && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <p className="text-rose-700 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.projectId}
                  </p>
                </div>
              )}

              {/* Champ montant */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Montant demandé (Ar) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="amount"
                    type="number"
                    min="10000"
                    max="100000000"
                    step="1000"
                    value={form.amount}
                    placeholder="Ex: 5000000"
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      errors.amount ? "border-rose-500 bg-rose-50" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.amount && (
                  <p className="text-rose-600 text-sm mt-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.amount}
                  </p>
                )}
                
                {form.amount && !errors.amount && (
                  <p className="text-gray-600 text-sm mt-2">
                    Montant saisi : <span className="text-emerald-600 font-semibold">{formatCurrency(form.amount)} Ar</span>
                  </p>
                )}

                {/* Informations sur les montants */}
                <div className="mt-3 space-y-1 text-xs text-gray-500">
                  <p>• Montant minimum : 10 000 Ar</p>
                  <p>• Montant maximum : 100 000 000 Ar</p>
                </div>
              </div>

              {/* Bouton de soumission */}
              <button
                onClick={handleSubmit}
                disabled={submitting || loadingProjects || projects.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Envoyer la demande</span>
                  </>
                )}
              </button>

              {/* Informations supplémentaires */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Traitement sous 72h</div>
                      <div>Délai moyen de traitement</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Suivi en temps réel</div>
                      <div>Statut de votre demande</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}