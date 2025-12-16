import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getMyFormations, 
  downloadCertificate 
} from "../../services/formationService";
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  Download, 
  PlayCircle,
  Award,
  Filter,
  Search,
  Loader2,
  AlertCircle,
  ChevronRight,
  BarChart3,
  Crown,
  X,
  SlidersHorizontal,
  Sparkles,
  Target,
  Users,
  Star
} from "lucide-react";
import ProgressBar from "../../components/ProgressBar";

// Composant Skeleton pour le chargement
const FormationSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <div className="h-6 bg-gray-300 rounded mb-2 w-3/4"></div>
        <div className="flex gap-2 mb-3">
          <div className="h-6 bg-gray-300 rounded-full w-20"></div>
          <div className="h-6 bg-gray-300 rounded-full w-24"></div>
        </div>
        <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
      </div>
      <div className="h-8 bg-gray-300 rounded w-24"></div>
    </div>
    <div className="h-2 bg-gray-300 rounded mb-4"></div>
    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
  </div>
);

// Composant Empty State
const EmptyFormations = ({ onDiscover }) => (
  <div className="text-center py-16 px-4">
    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <BookOpen className="w-12 h-12 text-purple-600" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-3">
      Aucune formation en cours
    </h3>
    <p className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
      Commencez votre parcours d'apprentissage en explorant notre catalogue de formations spécialement conçues pour les femmes entrepreneures.
    </p>
    <button
      onClick={onDiscover}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
    >
      <PlayCircle className="w-5 h-5" />
      Découvrir les formations
    </button>
  </div>
);

// Composant Error State
const ErrorState = ({ error, onRetry }) => (
  <div className="text-center py-16 px-4">
    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <AlertCircle className="w-12 h-12 text-red-600" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-3">
      Une erreur est survenue
    </h3>
    <p className="text-gray-600 max-w-md mx-auto mb-8">
      {error}
    </p>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-xl transition-colors duration-200"
    >
      <Loader2 className="w-5 h-5" />
      Réessayer
    </button>
  </div>
);

// Composant Badge de statut
const StatusBadge = ({ status }) => {
  const statusConfig = {
    inscrite: { 
      label: "Inscrite", 
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: BookOpen
    },
    en_cours: { 
      label: "En cours", 
      color: "bg-amber-100 text-amber-700 border-amber-200",
      icon: PlayCircle
    },
    terminée: { 
      label: "Terminée", 
      color: "bg-green-100 text-green-700 border-green-200",
      icon: Award
    },
    abandonnée: { 
      label: "Abandonnée", 
      color: "bg-red-100 text-red-700 border-red-200",
      icon: X
    },
    certifiée: { 
      label: "Certifiée", 
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: Crown
    }
  };

  const config = statusConfig[status] || statusConfig.inscrite;
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}>
      <IconComponent className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Hook personnalisé pour les filtres
const useFormationFilters = (enrollments) => {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
    sortBy: "progress"
  });

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = filters.search === "" || 
      enrollment.Formation?.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      enrollment.Formation?.category?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === "all" || enrollment.status === filters.status;
    const matchesCategory = filters.category === "all" || enrollment.Formation?.category === filters.category;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const sortedEnrollments = [...filteredEnrollments].sort((a, b) => {
    switch (filters.sortBy) {
      case "progress":
        return b.progress - a.progress;
      case "recent":
        return new Date(b.startedAt) - new Date(a.startedAt);
      case "title":
        return a.Formation?.title?.localeCompare(b.Formation?.title);
      case "duration":
        return (b.Formation?.duration || 0) - (a.Formation?.duration || 0);
      default:
        return 0;
    }
  });

  const statusCounts = enrollments.reduce((acc, enrollment) => {
    acc[enrollment.status] = (acc[enrollment.status] || 0) + 1;
    return acc;
  }, {});

  const categoryCounts = enrollments.reduce((acc, enrollment) => {
    const category = enrollment.Formation?.category;
    if (category) {
      acc[category] = (acc[category] || 0) + 1;
    }
    return acc;
  }, {});

  return {
    filters,
    setFilters,
    filteredEnrollments: sortedEnrollments,
    statusCounts,
    categoryCounts
  };
};

// Composant Formation Card
const FormationCard = ({ enrollment, onCertificateDownload, downloadingCert }) => {
  const navigate = useNavigate();
  const formation = enrollment.Formation;

  const getProgressVariant = (progress) => {
    if (progress === 100) return "success";
    if (progress >= 50) return "primary";
    return "default";
  };

  return (
    <div
      className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-purple-200 cursor-pointer transform hover:scale-[1.02]"
      onClick={() => navigate(`/woman/formations/${enrollment.id}`)}
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
              {formation?.title}
            </h3>
            {enrollment.progress === 100 && (
              <Crown className="w-5 h-5 text-amber-500" />
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <StatusBadge status={enrollment.status} />
            <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
              {formation?.category}
            </span>
            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center gap-1">
              <Award className="w-4 h-4" />
              {formation?.level}
            </span>
          </div>

          <ProgressBar 
            percent={enrollment.progress} 
            variant={getProgressVariant(enrollment.progress)}
            showLabel={true}
            className="mb-4"
          />

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {formation?.modules?.length || 0} modules
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formation?.duration}h
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Démarré le {new Date(enrollment.startedAt).toLocaleDateString('fr-FR')}
            </span>
            {enrollment.completedAt && (
              <span className="flex items-center gap-1 text-green-600">
                <Award className="w-4 h-4" />
                Terminé le {new Date(enrollment.completedAt).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
          {enrollment.certificateUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCertificateDownload(enrollment);
              }}
              disabled={downloadingCert === enrollment.id}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {downloadingCert === enrollment.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Certificat
            </button>
          )}
          
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200">
            Continuer
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant Stats Card
const StatsCard = ({ icon: Icon, label, value, color = "purple", subtitle }) => {
  const colors = {
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
    pink: "bg-pink-100 text-pink-600"
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{label}</div>
          {subtitle && (
            <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function MyFormations() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingCert, setDownloadingCert] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const navigate = useNavigate();

  const { filters, setFilters, filteredEnrollments, statusCounts, categoryCounts } = useFormationFilters(enrollments);

  useEffect(() => {
    loadMyFormations();
  }, []);

  const loadMyFormations = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getMyFormations();
      setEnrollments(data.enrollments || []);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement de vos formations");
      console.error('Erreur chargement formations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCertificateDownload = async (enrollment) => {
    try {
      setDownloadingCert(enrollment.id);
      const certificateUrl = await downloadCertificate(enrollment.id);
      
      const link = document.createElement('a');
      link.href = certificateUrl;
      link.download = `certificat-${enrollment.Formation?.title}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (window.toast) {
        window.toast.success("Certificat téléchargé avec succès !");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Erreur lors du téléchargement du certificat";
      if (window.toast) {
        window.toast.error(errorMsg);
      } else {
        alert(errorMsg);
      }
    } finally {
      setDownloadingCert(null);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      category: "all",
      sortBy: "progress"
    });
    setShowMobileFilters(false);
  };

  const hasActiveFilters = filters.search !== "" || filters.status !== "all" || filters.category !== "all";

  // Calcul des statistiques
  const stats = {
    total: enrollments.length,
    completed: enrollments.filter(e => e.progress === 100).length,
    inProgress: enrollments.filter(e => e.progress > 0 && e.progress < 100).length,
    averageProgress: Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length) || 0,
    certificates: enrollments.filter(e => e.certificateUrl).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => <FormationSkeleton key={i} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorState error={error} onRetry={loadMyFormations} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Mes Formations
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Suivez votre progression et accédez à vos certificats
          </p>
        </div>

        {/* Statistiques rapides */}
        {enrollments.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              icon={BookOpen}
              label="Formations"
              value={stats.total}
              color="purple"
            />
            <StatsCard
              icon={Target}
              label="Terminées"
              value={stats.completed}
              color="green"
              subtitle={`${Math.round((stats.completed / stats.total) * 100)}%`}
            />
            <StatsCard
              icon={BarChart3}
              label="Progression moyenne"
              value={`${stats.averageProgress}%`}
              color="blue"
            />
            <StatsCard
              icon={Award}
              label="Certificats"
              value={stats.certificates}
              color="amber"
            />
          </div>
        )}

        {/* Filtres et recherche */}
        {enrollments.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Barre de recherche */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une formation..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>

              {/* Bouton filtres mobile */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filtres
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                )}
              </button>

              {/* Filtres desktop */}
              <div className="hidden lg:flex flex-wrap gap-3">
                {/* Filtre par statut */}
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white cursor-pointer"
                >
                  <option value="all">Tous les statuts</option>
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <option key={status} value={status}>
                      {status} ({count})
                    </option>
                  ))}
                </select>

                {/* Filtre par catégorie */}
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white cursor-pointer"
                >
                  <option value="all">Toutes catégories</option>
                  {Object.entries(categoryCounts).map(([category, count]) => (
                    <option key={category} value={category}>
                      {category} ({count})
                    </option>
                  ))}
                </select>

                {/* Tri */}
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white cursor-pointer"
                >
                  <option value="progress">Progression</option>
                  <option value="recent">Plus récent</option>
                  <option value="title">Ordre alphabétique</option>
                  <option value="duration">Durée</option>
                </select>

                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-2 px-4 py-3 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200 whitespace-nowrap"
                  >
                    <X className="w-4 h-4" />
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {/* Filtres mobile */}
            {showMobileFilters && (
              <div className="lg:hidden mt-4 space-y-3">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white cursor-pointer"
                >
                  <option value="all">Tous les statuts</option>
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <option key={status} value={status}>
                      {status} ({count})
                    </option>
                  ))}
                </select>

                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white cursor-pointer"
                >
                  <option value="all">Toutes catégories</option>
                  {Object.entries(categoryCounts).map(([category, count]) => (
                    <option key={category} value={category}>
                      {category} ({count})
                    </option>
                  ))}
                </select>

                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white cursor-pointer"
                >
                  <option value="progress">Progression</option>
                  <option value="recent">Plus récent</option>
                  <option value="title">Ordre alphabétique</option>
                </select>

                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}

            {/* Indicateurs de filtres actifs */}
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap gap-2">
                {filters.search && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    Recherche: "{filters.search}"
                    <button onClick={() => setFilters({ ...filters, search: '' })}>
                      <X className="w-3 h-3 hover:text-purple-900" />
                    </button>
                  </span>
                )}
                {filters.status !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Statut: {filters.status}
                    <button onClick={() => setFilters({ ...filters, status: 'all' })}>
                      <X className="w-3 h-3 hover:text-blue-900" />
                    </button>
                  </span>
                )}
                {filters.category !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Catégorie: {filters.category}
                    <button onClick={() => setFilters({ ...filters, category: 'all' })}>
                      <X className="w-3 h-3 hover:text-green-900" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* En-tête des résultats */}
        {enrollments.length > 0 && (
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              {filteredEnrollments.length} formation{filteredEnrollments.length > 1 ? 's' : ''} 
              {hasActiveFilters && ' correspondant à vos critères'}
            </div>
            
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
              >
                Tout effacer
              </button>
            )}
          </div>
        )}

        {/* Liste des formations */}
        {enrollments.length === 0 ? (
          <EmptyFormations onDiscover={() => navigate("/woman/formations")} />
        ) : filteredEnrollments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune formation trouvée
            </h3>
            <p className="text-gray-600 mb-4">
              Essayez de modifier vos critères de recherche
            </p>
            <button
              onClick={handleResetFilters}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEnrollments.map(enrollment => (
              <FormationCard
                key={enrollment.id}
                enrollment={enrollment}
                onCertificateDownload={handleCertificateDownload}
                downloadingCert={downloadingCert}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}