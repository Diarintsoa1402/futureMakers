/* FICHIER: src/pages/children/Courses.jsx - Version Enfants */
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllCourses, getCategories } from "../../services/course";
import { toast } from "react-hot-toast";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState(new Set());

  // Charger les favoris au démarrage
  useEffect(() => {
    const savedBookmarks = JSON.parse(localStorage.getItem('courseBookmarks') || '[]');
    setBookmarks(new Set(savedBookmarks));
  }, []);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadCourses();
  }, [search, selectedCategory, selectedDifficulty, currentPage]);

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      const cats = res?.data?.data ?? res?.data ?? [];
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des catégories");
    }
  };

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        search,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        difficulty: selectedDifficulty !== "all" ? selectedDifficulty : undefined,
        sort: "createdAt"
      };

      const res = await getAllCourses(params);
      const payload = res?.data?.data ?? {};
      setCourses(Array.isArray(payload.courses) ? payload.courses : []);
      setTotalPages(payload.pagination?.totalPages ?? 1);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des cours");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = (courseId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newBookmarks = new Set(bookmarks);
    if (newBookmarks.has(courseId)) {
      newBookmarks.delete(courseId);
      toast.success("❌ Cours retiré des favoris");
    } else {
      newBookmarks.add(courseId);
      toast.success("⭐ Cours ajouté aux favoris !");
    }
    
    setBookmarks(newBookmarks);
    localStorage.setItem('courseBookmarks', JSON.stringify([...newBookmarks]));
  };

  const getDifficultyEmoji = (difficulty) => {
    switch (difficulty) {
      case 'débutant': return '🟢';
      case 'intermédiaire': return '🟡';
      case 'avancé': return '🔴';
      default: return '⚪';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'débutant': return 'Facile';
      case 'intermédiaire': return 'Moyen';
      case 'avancé': return 'Difficile';
      default: return difficulty;
    }
  };

  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'Mathématiques': '🔢',
      'Sciences': '🔬',
      'Français': '📚',
      'Anglais': '🇬🇧',
      'Histoire': '🏛️',
      'Géographie': '🌍',
      'Arts': '🎨',
      'Musique': '🎵',
      'Sport': '⚽',
      'Informatique': '💻',
    };
    return emojiMap[category] || '📖';
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedDifficulty("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = search || selectedCategory !== "all" || selectedDifficulty !== "all";

  const featuredCourses = useMemo(() => {
    return courses.filter(course => course.rating >= 4.5).slice(0, 3);
  }, [courses]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 pb-12">
      {/* En-tête coloré */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-4 drop-shadow-lg animate-pulse">
            🎓 Mes Super Cours ! 🎓
          </h1>
          <p className="text-xl md:text-2xl font-bold mb-8">
            Apprends en t'amusant avec nos cours géniaux !
          </p>

          {/* Statistiques ludiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="text-4xl font-black">{courses.length}</div>
              <div className="text-sm font-medium">📚 Cours</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="text-4xl font-black">{categories.length}</div>
              <div className="text-sm font-medium">🎯 Catégories</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="text-4xl font-black">{bookmarks.size}</div>
              <div className="text-sm font-medium">⭐ Favoris</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="text-4xl font-black">∞</div>
              <div className="text-sm font-medium">🚀 Fun</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8">
        {/* Barre de recherche ludique */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-8 border-4 border-purple-300">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-3xl">
                🔍
              </div>
              <input
                type="text"
                placeholder="Cherche un cours super cool..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-16 pr-6 py-4 text-lg border-4 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-400 focus:border-purple-500 transition-all font-bold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Catégorie */}
              <div>
                <label className="block text-sm font-black text-purple-700 mb-2">
                  📂 Catégorie
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3 text-lg border-4 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-400 focus:border-purple-500 font-bold bg-white"
                >
                  <option value="all">🌈 Toutes les catégories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {getCategoryEmoji(cat)} {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulté */}
              <div>
                <label className="block text-sm font-black text-purple-700 mb-2">
                  🎮 Niveau
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => {
                    setSelectedDifficulty(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3 text-lg border-4 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-400 focus:border-purple-500 font-bold bg-white"
                >
                  <option value="all">🌟 Tous les niveaux</option>
                  <option value="débutant">🟢 Facile</option>
                  <option value="intermédiaire">🟡 Moyen</option>
                  <option value="avancé">🔴 Difficile</option>
                </select>
              </div>

              {/* Bouton effacer */}
              <div className="flex items-end">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full bg-red-500 text-white px-6 py-3 rounded-2xl font-black text-lg hover:bg-red-600 transition-all transform hover:scale-105 shadow-lg"
                  >
                    ❌ Tout effacer
                  </button>
                )}
              </div>
            </div>

            {/* Badges de filtres actifs */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {search && (
                  <span className="inline-flex items-center gap-2 bg-purple-200 text-purple-800 px-4 py-2 rounded-full font-bold">
                    🔍 "{search}"
                    <button onClick={() => setSearch("")} className="hover:scale-125 transition-transform">
                      ❌
                    </button>
                  </span>
                )}
                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center gap-2 bg-blue-200 text-blue-800 px-4 py-2 rounded-full font-bold">
                    {getCategoryEmoji(selectedCategory)} {selectedCategory}
                    <button onClick={() => setSelectedCategory("all")} className="hover:scale-125 transition-transform">
                      ❌
                    </button>
                  </span>
                )}
                {selectedDifficulty !== "all" && (
                  <span className="inline-flex items-center gap-2 bg-green-200 text-green-800 px-4 py-2 rounded-full font-bold">
                    {getDifficultyEmoji(selectedDifficulty)} {getDifficultyLabel(selectedDifficulty)}
                    <button onClick={() => setSelectedDifficulty("all")} className="hover:scale-125 transition-transform">
                      ❌
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cours recommandés */}
        {featuredCourses.length > 0 && currentPage === 1 && !hasActiveFilters && (
          <div className="mb-8">
            <h2 className="text-4xl font-black text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
              ⭐ Les Cours les Plus Cools ! ⭐
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <Link
                  key={course.id}
                  to={`/child/courses/${course.id}`}
                  className="group relative bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-4 border-yellow-400"
                >
                  {/* Badge recommandé */}
                  <div className="absolute top-4 left-4 z-10 bg-yellow-500 text-white px-4 py-2 rounded-full font-black text-sm shadow-lg animate-pulse">
                    🌟 TOP !
                  </div>

                  {/* Bouton favori */}
                  <button
                    onClick={(e) => toggleBookmark(course.id, e)}
                    className="absolute top-4 right-4 z-10 bg-white/90 p-3 rounded-full shadow-lg hover:scale-125 transition-transform"
                  >
                    <span className="text-2xl">{bookmarks.has(course.id) ? '❤️' : '🤍'}</span>
                  </button>

                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-yellow-400 to-orange-500 overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        📚
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-white px-3 py-1 rounded-full text-sm font-black">
                        {getCategoryEmoji(course.category)} {course.category}
                      </span>
                      <span className="bg-white px-3 py-1 rounded-full text-sm font-black">
                        {getDifficultyEmoji(course.difficulty)} {getDifficultyLabel(course.difficulty)}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-gray-700 text-sm mb-4 line-clamp-2 font-medium">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between text-sm font-bold">
                      <div className="flex items-center gap-1 text-purple-600">
                        ⏱️ {course.duration} min
                      </div>
                      {course.rating > 0 && (
                        <div className="flex items-center gap-1 text-yellow-600">
                          ⭐ {course.rating.toFixed(1)}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t-2 border-yellow-300">
                      <div className="text-center text-orange-600 font-black text-lg">
                        🚀 C'est parti !
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Titre des résultats */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-black text-purple-700 mb-2">
            {hasActiveFilters ? '🔍 Résultats de ta recherche' : '📚 Tous les cours'}
          </h2>
          <p className="text-xl font-bold text-gray-600">
            {courses.length} cours {hasActiveFilters ? 'trouvés' : 'disponibles'} • Page {currentPage}/{totalPages}
          </p>
        </div>

        {/* Grille de cours */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-300 rounded-full w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded-full w-full"></div>
                  <div className="h-4 bg-gray-300 rounded-full w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-xl">
            <div className="text-8xl mb-4">😢</div>
            <h3 className="text-3xl font-black text-gray-900 mb-4">
              Oups ! Aucun cours trouvé
            </h3>
            <p className="text-xl text-gray-600 mb-6 max-w-md mx-auto font-medium">
              {hasActiveFilters 
                ? "On n'a pas trouvé de cours avec ces critères. Essaie autre chose !"
                : "Il n'y a pas encore de cours disponibles."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-black text-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
              >
                🌈 Voir tous les cours
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/child/courses/${course.id}`}
                className="group bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-4 border-transparent hover:border-purple-400"
              >
                {/* Bouton favori */}
                <div className="relative">
                  <button
                    onClick={(e) => toggleBookmark(course.id, e)}
                    className="absolute top-4 right-4 z-10 bg-white/90 p-2 rounded-full shadow-lg hover:scale-125 transition-transform"
                  >
                    <span className="text-xl">{bookmarks.has(course.id) ? '❤️' : '🤍'}</span>
                  </button>

                  {/* Image */}
                  <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500 overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        {getCategoryEmoji(course.category)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-black">
                      {getCategoryEmoji(course.category)} {course.category}
                    </span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">
                      {getDifficultyEmoji(course.difficulty)} {getDifficultyLabel(course.difficulty)}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 font-medium">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between text-sm font-bold">
                    <div className="flex items-center gap-4">
                      <span className="text-blue-600">⏱️ {course.duration} min</span>
                      {course.enrollmentCount > 0 && (
                        <span className="text-green-600">👥 {course.enrollmentCount}</span>
                      )}
                    </div>
                    {course.rating > 0 && (
                      <div className="text-yellow-600">⭐ {course.rating.toFixed(1)}</div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t-2 border-gray-200">
                    <div className="text-center text-purple-600 font-black">
                      🎯 Découvrir →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination ludique */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-6 py-3 bg-purple-500 text-white rounded-2xl font-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-all transform hover:scale-105 shadow-lg"
            >
              ⬅️ Avant
            </button>

            <div className="flex gap-2">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-12 h-12 rounded-xl font-black text-lg transition-all transform hover:scale-110 ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-110'
                        : 'bg-white text-purple-600 border-4 border-purple-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-6 py-3 bg-purple-500 text-white rounded-2xl font-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-all transform hover:scale-105 shadow-lg"
            >
              Après ➡️
            </button>
          </div>
        )}

        {/* Message de motivation */}
        <div className="mt-12 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-3xl p-8 text-white text-center shadow-2xl">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-3xl font-black mb-3">Continue d'apprendre !</h3>
          <p className="text-xl font-bold">
            Chaque cours te rend plus intelligent ! Tu es super ! 🌟
          </p>
        </div>
      </div>
    </div>
  );
}