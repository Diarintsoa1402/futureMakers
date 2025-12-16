import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getAvailableFormations, enrollFormation } from "../../services/formationService";
import FormationCard from "../../components/FormationCard";
import { Search, Filter, Loader2, AlertCircle, X, SlidersHorizontal } from "lucide-react";

// Custom hook pour la gestion des filtres
const useFilters = () => {
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    level: "all",
    status: "all"
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      category: "all",
      level: "all",
      status: "all"
    });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'status' && value !== "" && value !== "all"
  );

  return { filters, updateFilter, resetFilters, hasActiveFilters };
};

// Composant Loading State
const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
      <p className="text-gray-600">Chargement des formations...</p>
    </div>
  </div>
);

// Composant Error State
const ErrorState = ({ error, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md w-full text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        <h3 className="text-lg font-semibold text-red-900">Erreur</h3>
      </div>
      <p className="text-red-700 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
      >
        Réessayer
      </button>
    </div>
  </div>
);

// Composant Empty State
const EmptyState = ({ hasActiveFilters, onReset }) => (
  <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Search className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Aucune formation trouvée
    </h3>
    <p className="text-gray-600 mb-4">
      {hasActiveFilters 
        ? "Essayez de modifier vos critères de recherche" 
        : "Aucune formation n'est disponible pour le moment"
      }
    </p>
    {hasActiveFilters && (
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200"
      >
        Afficher toutes les formations
      </button>
    )}
  </div>
);

// Composant SearchBar
const SearchBar = ({ value, onChange, placeholder = "Rechercher une formation..." }) => (
  <div className="flex-1 relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
    />
  </div>
);

// Composant FilterSection
const FilterSection = ({ filters, updateFilter, hasActiveFilters, onReset, isMobileOpen, onMobileToggle }) => {
  const filterContent = (
    <div className="flex flex-col sm:flex-row gap-3">
      <select
        value={filters.category}
        onChange={(e) => updateFilter('category', e.target.value)}
        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white cursor-pointer transition-colors duration-200"
      >
        <option value="all">Toutes catégories</option>
        <option value="entrepreneuriat">Entrepreneuriat</option>
        <option value="marketing">Marketing</option>
        <option value="finance">Finance</option>
        <option value="leadership">Leadership</option>
        <option value="technologie">Technologie</option>
        <option value="design">Design</option>
        <option value="developpement">Développement</option>
      </select>

      <select
        value={filters.level}
        onChange={(e) => updateFilter('level', e.target.value)}
        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white cursor-pointer transition-colors duration-200"
      >
        <option value="all">Tous niveaux</option>
        <option value="débutant">Débutant</option>
        <option value="intermédiaire">Intermédiaire</option>
        <option value="avancé">Avancé</option>
        <option value="expert">Expert</option>
      </select>

      <select
        value={filters.status}
        onChange={(e) => updateFilter('status', e.target.value)}
        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white cursor-pointer transition-colors duration-200"
      >
        <option value="all">Tous les statuts</option>
        <option value="available">Disponible</option>
        <option value="upcoming">À venir</option>
        <option value="ongoing">En cours</option>
      </select>

      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200 whitespace-nowrap"
        >
          <X className="w-4 h-4" />
          Réinitialiser
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Bouton filtres mobile */}
      <button
        onClick={onMobileToggle}
        className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
      >
        <SlidersHorizontal className="w-5 h-5" />
        Filtres
        {hasActiveFilters && (
          <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
        )}
      </button>

      {/* Filtres desktop */}
      <div className="hidden lg:flex flex-col sm:flex-row gap-3">
        {filterContent}
      </div>

      {/* Filtres mobile */}
      {isMobileOpen && (
        <div className="lg:hidden bg-white rounded-lg p-4 border border-gray-200 mt-2">
          {filterContent}
        </div>
      )}
    </>
  );
};

export default function FormationCatalog() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { filters, updateFilter, resetFilters, hasActiveFilters } = useFilters();

  useEffect(() => {
    loadFormations();
  }, []);

  const loadFormations = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getAvailableFormations();
      setFormations(data.formations || []);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement des formations");
      console.error('Erreur chargement formations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = useCallback(async (formation) => {
    if (!window.confirm(`Voulez-vous vous inscrire à "${formation.title}" ?`)) return;
    
    try {
      setEnrolling(formation.id);
      await enrollFormation(formation.id);
      
      // Notification plus moderne
      if (window.toast) {
        window.toast.success("Inscription réussie ! Rendez-vous dans 'Mes Formations'");
      } else {
        alert("✅ Inscription réussie ! Rendez-vous dans 'Mes Formations'");
      }
      
      await loadFormations();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erreur lors de l'inscription";
      
      if (window.toast) {
        window.toast.error(errorMessage);
      } else {
        alert(errorMessage);
      }
    } finally {
      setEnrolling(null);
    }
  }, []);

  // Filtrage optimisé avec useMemo
  const filteredFormations = useMemo(() => {
    return formations.filter(formation => {
      const matchesSearch = filters.search === "" || 
        formation.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        formation.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        formation.instructor?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCategory = filters.category === "all" || formation.category === filters.category;
      const matchesLevel = filters.level === "all" || formation.level === filters.level;
      const matchesStatus = filters.status === "all" || formation.status === filters.status;
      
      return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
    });
  }, [formations, filters]);

  const handleResetAll = () => {
    resetFilters();
    setShowMobileFilters(false);
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={loadFormations} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header amélioré */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Catalogue de Formations
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Développez vos compétences avec notre sélection de formations expertes
          </p>
        </div>

        {/* Barre de recherche et filtres améliorée */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <SearchBar 
              value={filters.search}
              onChange={(value) => updateFilter('search', value)}
              placeholder="Rechercher par titre, description ou formateur..."
            />
            
            <FilterSection
              filters={filters}
              updateFilter={updateFilter}
              hasActiveFilters={hasActiveFilters}
              onReset={handleResetAll}
              isMobileOpen={showMobileFilters}
              onMobileToggle={() => setShowMobileFilters(!showMobileFilters)}
            />
          </div>

          {/* Indicateurs de filtres actifs */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  Recherche: "{filters.search}"
                  <button onClick={() => updateFilter('search', '')}>
                    <X className="w-3 h-3 hover:text-purple-900" />
                  </button>
                </span>
              )}
              {filters.category !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Catégorie: {filters.category}
                  <button onClick={() => updateFilter('category', 'all')}>
                    <X className="w-3 h-3 hover:text-blue-900" />
                  </button>
                </span>
              )}
              {filters.level !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Niveau: {filters.level}
                  <button onClick={() => updateFilter('level', 'all')}>
                    <X className="w-3 h-3 hover:text-green-900" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* En-tête des résultats */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            {filteredFormations.length} formation{filteredFormations.length > 1 ? 's' : ''} 
            {hasActiveFilters && ' correspondant à vos critères'}
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={handleResetAll}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
            >
              Tout effacer
            </button>
          )}
        </div>

        {/* Grille de formations */}
        {filteredFormations.length === 0 ? (
          <EmptyState 
            hasActiveFilters={hasActiveFilters} 
            onReset={handleResetAll} 
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredFormations.map((formation) => (
              <FormationCard
                key={formation.id}
                formation={formation}
                onAction={handleEnroll}
                actionLabel={enrolling === formation.id ? "Inscription..." : "S'inscrire"}
                disabled={enrolling === formation.id}
                showProgress={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}