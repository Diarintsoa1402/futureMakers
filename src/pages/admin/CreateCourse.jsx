/* FICHIER: src/pages/admin/AdminCourses.jsx */
import { useEffect, useState, useCallback } from "react";
import { 
  getAllCoursesAdmin, 
  createCourse, 
  updateCourse,
  deleteCourse, 
  togglePublishCourse,
  getCourseStats,
  duplicateCourse
} from "../../services/course";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  BookOpen,
  TrendingUp,
  FileText,
  Filter,
  Copy,
  Download,
  Upload,
  BarChart3,
  Users,
  Star,
  Clock,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Tag
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ 
    category: "all", 
    difficulty: "all", 
    status: "all" 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [ setShowBulkActions] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "général",
    difficulty: "débutant",
    duration: 0,
    thumbnail: "",
    tags: [],
    supports: [],
    objectives: [],
    instructor: ""
  });

  const [tagInput, setTagInput] = useState("");
  const [objectiveInput, setObjectiveInput] = useState("");
  const [activeSupportTab, setActiveSupportTab] = useState("basic");

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: search || undefined,
        ...(filter.category !== "all" && { category: filter.category }),
        ...(filter.difficulty !== "all" && { difficulty: filter.difficulty }),
        ...(filter.status !== "all" && { status: filter.status })
      };
      
      const res = await getAllCoursesAdmin(params);
      if (res.data.success) {
        setCourses(res.data.data.courses);
        setTotalPages(res.data.data.pagination.totalPages);
      } else {
        toast.error("Erreur lors du chargement des cours");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des cours");
    } finally {
      setIsLoading(false);
    }
  }, [search, filter, currentPage]);

  const loadStats = async () => {
    try {
      const res = await getCourseStats();
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des statistiques");
    }
  };

  useEffect(() => {
    loadCourses();
    loadStats();
  }, [loadCourses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingCourse) {
        res = await updateCourse(editingCourse.id, formData);
      } else {
        res = await createCourse(formData);
      }
      
      if (res.data.success) {
        toast.success(res.data.message);
        resetForm();
        loadCourses();
        loadStats();
      } else {
        toast.error(res.data.message);
      }
    } catch  {
      toast.error("Erreur lors de la sauvegarde du cours");
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      duration: course.duration,
      thumbnail: course.thumbnail || "",
      tags: course.tags || [],
      supports: course.supports || [],
      objectives: course.objectives || [],
      instructor: course.instructor || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible.")) return;
    try {
      const res = await deleteCourse(id);
      if (res.data.success) {
        toast.success(res.data.message);
        loadCourses();
        loadStats();
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await togglePublishCourse(id);
      if (res.data.success) {
        toast.success(res.data.message);
        loadCourses();
        loadStats();
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Erreur lors de la modification du statut");
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await duplicateCourse(id);
      if (res.data.success) {
        toast.success(res.data.message);
        loadCourses();
        loadStats();
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Erreur lors de la duplication");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "général",
      difficulty: "débutant",
      duration: 0,
      thumbnail: "",
      tags: [],
      supports: [],
      objectives: [],
      instructor: ""
    });
    setEditingCourse(null);
    setShowModal(false);
    setTagInput("");
    setObjectiveInput("");
    setActiveSupportTab("basic");
  };

  const addSupport = () => {
    setFormData({
      ...formData,
      supports: [...formData.supports, { 
        type: "video", 
        title: "", 
        url: "",
        duration: 0,
        description: "",
        isSectionHeader: false
      }]
    });
  };

  const addSectionHeader = () => {
    setFormData({
      ...formData,
      supports: [...formData.supports, { 
        type: "section", 
        title: "Nouvelle section", 
        isSectionHeader: true
      }]
    });
  };

  const updateSupport = (index, field, value) => {
    const newSupports = [...formData.supports];
    newSupports[index][field] = value;
    setFormData({ ...formData, supports: newSupports });
  };

  const removeSupport = (index) => {
    const newSupports = formData.supports.filter((_, i) => i !== index);
    setFormData({ ...formData, supports: newSupports });
  };

  const moveSupport = (index, direction) => {
    const newSupports = [...formData.supports];
    if (direction === 'up' && index > 0) {
      [newSupports[index], newSupports[index - 1]] = [newSupports[index - 1], newSupports[index]];
    } else if (direction === 'down' && index < newSupports.length - 1) {
      [newSupports[index], newSupports[index + 1]] = [newSupports[index + 1], newSupports[index]];
    }
    setFormData({ ...formData, supports: newSupports });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput("");
    }
  };

  const removeTag = (index) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData({ ...formData, tags: newTags });
  };

  const addObjective = () => {
    if (objectiveInput.trim()) {
      setFormData({
        ...formData,
        objectives: [...formData.objectives, objectiveInput.trim()]
      });
      setObjectiveInput("");
    }
  };

  const removeObjective = (index) => {
    const newObjectives = formData.objectives.filter((_, i) => i !== index);
    setFormData({ ...formData, objectives: newObjectives });
  };

  const toggleCourseSelection = (courseId) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedCourses(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedCourses.size === courses.length) {
      setSelectedCourses(new Set());
    } else {
      setSelectedCourses(new Set(courses.map(course => course.id)));
    }
  };

  const handleBulkAction = async () => {
    if (selectedCourses.size === 0) {
      toast.error("Aucun cours sélectionné");
      return;
    }

    if (!bulkAction) {
      toast.error("Veuillez sélectionner une action");
      return;
    }

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const courseId of selectedCourses) {
        try {
          if (bulkAction === 'delete') {
            await deleteCourse(courseId);
          } else if (bulkAction === 'publish') {
            await togglePublishCourse(courseId);
          } else if (bulkAction === 'unpublish') {
            await togglePublishCourse(courseId);
          }
          successCount++;
        } catch  {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} cours traités avec succès`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} erreurs lors du traitement`);
      }

      setSelectedCourses(new Set());
      setBulkAction("");
      setShowBulkActions(false);
      loadCourses();
      loadStats();
    } catch  {
      toast.error("Erreur lors de l'action groupée");
    }
  };

  const exportCourses = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      totalCourses: courses.length,
      courses: courses.map(course => ({
        id: course.id,
        title: course.title,
        category: course.category,
        difficulty: course.difficulty,
        isPublished: course.isPublished,
        enrollmentCount: course.enrollmentCount,
        rating: course.rating,
        duration: course.duration,
        createdAt: course.createdAt
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `courses-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Cours exportés avec succès");
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'débutant': return 'bg-green-100 text-green-700';
      case 'intermédiaire': return 'bg-yellow-100 text-yellow-700';
      case 'avancé': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

 

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Cours</h1>
            <p className="text-gray-600 mt-1">Créez et gérez votre catalogue de formations</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={exportCourses}
              className="flex items-center gap-2 bg-white text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300"
            >
              <Download size={20} />
              Exporter
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
            >
              <Plus size={20} />
              Nouveau Cours
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Cours</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <BookOpen className="text-indigo-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Publiés</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.published}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Brouillons</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">{stats.drafts}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <FileText className="text-orange-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Apprenants Total</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {stats.popularCourses?.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0) || 0}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedCourses.size > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-yellow-600" size={20} />
                <span className="text-yellow-800 font-medium">
                  {selectedCourses.size} cours sélectionnés
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Actions groupées...</option>
                  <option value="publish">Publier</option>
                  <option value="unpublish">Dépublier</option>
                  <option value="delete">Supprimer</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Appliquer
                </button>
                <button
                  onClick={() => setSelectedCourses(new Set())}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un cours..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <select
              value={filter.category}
              onChange={(e) => {
                setFilter({ ...filter, category: e.target.value });
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Toutes les catégories</option>
              <option value="général">Général</option>
              <option value="mathématiques">Mathématiques</option>
              <option value="sciences">Sciences</option>
              <option value="langues">Langues</option>
              <option value="informatique">Informatique</option>
            </select>

            <select
              value={filter.difficulty}
              onChange={(e) => {
                setFilter({ ...filter, difficulty: e.target.value });
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Tous les niveaux</option>
              <option value="débutant">Débutant</option>
              <option value="intermédiaire">Intermédiaire</option>
              <option value="avancé">Avancé</option>
            </select>

            <select
              value={filter.status}
              onChange={(e) => {
                setFilter({ ...filter, status: e.target.value });
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="published">Publiés</option>
              <option value="draft">Brouillons</option>
            </select>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                    <input
                      type="checkbox"
                      checked={selectedCourses.size === courses.length && courses.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Niveau
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscrits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Note
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-4"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-3 bg-gray-200 rounded w-48"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <div className="h-8 w-8 bg-gray-200 rounded"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">Aucun cours trouvé</p>
                      <p className="text-gray-600">Essayez de modifier vos critères de recherche ou créez un nouveau cours.</p>
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedCourses.has(course.id)}
                          onChange={() => toggleCourseSelection(course.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {course.thumbnail ? (
                            <img 
                              src={course.thumbnail} 
                              alt={course.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                              <BookOpen size={20} className="text-indigo-600" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {course.title}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1 max-w-md">
                              {course.description}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock size={12} className="text-gray-400" />
                              <span className="text-xs text-gray-500">{course.duration} min</span>
                              {course.tags && course.tags.length > 0 && (
                                <>
                                  <Tag size={12} className="text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {course.tags.slice(0, 2).join(', ')}
                                    {course.tags.length > 2 && '...'}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          {course.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getDifficultyColor(course.difficulty)}`}>
                          {course.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePublish(course.id)}
                          className={`flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                            course.isPublished
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {course.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                          {course.isPublished ? 'Publié' : 'Brouillon'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-900">
                          <Users size={16} className="text-gray-400" />
                          {course.enrollmentCount || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {course.rating > 0 ? (
                          <div className="flex items-center gap-1">
                            <Star size={16} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{course.rating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(course)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(course.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Dupliquer"
                          >
                            <Copy size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {courses.length > 0 && (
                  <>
                    Affichage de {((currentPage - 1) * 10) + 1} à {Math.min(currentPage * 10, courses.length + ((currentPage - 1) * 10))} sur {courses.length + ((currentPage - 1) * 10)} cours
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Précédent
                </button>
                <span className="text-gray-600 px-4">
                  Page {currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCourse ? 'Modifier le cours' : 'Nouveau cours'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Navigation Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    type="button"
                    onClick={() => setActiveSupportTab("basic")}
                    className={`py-3 px-4 text-center border-b-2 font-medium text-sm ${
                      activeSupportTab === "basic"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Informations de base
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSupportTab("supports")}
                    className={`py-3 px-4 text-center border-b-2 font-medium text-sm ${
                      activeSupportTab === "supports"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Contenu du cours
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSupportTab("advanced")}
                    className={`py-3 px-4 text-center border-b-2 font-medium text-sm ${
                      activeSupportTab === "advanced"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Configuration avancée
                  </button>
                </nav>
              </div>

              {/* Basic Info Tab */}
              {activeSupportTab === "basic" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre du cours *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Ex: Introduction à la programmation"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        required
                        rows="4"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Décrivez le contenu du cours, les objectifs d'apprentissage, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catégorie
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="général">Général</option>
                        <option value="mathématiques">Mathématiques</option>
                        <option value="sciences">Sciences</option>
                        <option value="langues">Langues</option>
                        <option value="informatique">Informatique</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Niveau de difficulté
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="débutant">Débutant</option>
                        <option value="intermédiaire">Intermédiaire</option>
                        <option value="avancé">Avancé</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durée totale (minutes)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instructeur
                      </label>
                      <input
                        type="text"
                        value={formData.instructor}
                        onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Nom de l'instructeur"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image de couverture (URL)
                      </label>
                      <input
                        type="url"
                        value={formData.thumbnail}
                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                      />
                      {formData.thumbnail && (
                        <div className="mt-2">
                          <img 
                            src={formData.thumbnail} 
                            alt="Aperçu" 
                            className="h-32 object-cover rounded-lg border"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Supports Tab */}
              {activeSupportTab === "supports" && (
                <div className="space-y-6">
                  {/* Objectifs d'apprentissage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Objectifs d'apprentissage
                    </label>
                    <div className="space-y-3">
                      {formData.objectives.map((objective, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                          <span className="flex-1 bg-gray-50 px-3 py-2 rounded border">{objective}</span>
                          <button
                            type="button"
                            onClick={() => removeObjective(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={objectiveInput}
                          onChange={(e) => setObjectiveInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                          placeholder="Ajouter un objectif d'apprentissage..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={addObjective}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="text-blue-700 hover:text-blue-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Ajouter un tag..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>

                  {/* Supports de cours */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Contenu du cours
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={addSectionHeader}
                          className="flex items-center gap-2 text-gray-600 hover:text-gray-700 text-sm font-medium px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <Plus size={16} />
                          Section
                        </button>
                        <button
                          type="button"
                          onClick={addSupport}
                          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium px-3 py-2 border border-indigo-300 rounded-lg"
                        >
                          <Plus size={16} />
                          Ressource
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {formData.supports.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                          <p className="text-gray-500 mb-2">Aucun contenu ajouté</p>
                          <p className="text-gray-400 text-sm">Commencez par ajouter des sections et des ressources</p>
                        </div>
                      ) : (
                        formData.supports.map((support, index) => (
                          <div key={index} className={`border rounded-lg p-4 ${
                            support.isSectionHeader 
                              ? 'bg-purple-50 border-purple-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}>
                            {support.isSectionHeader ? (
                              <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                  <BookOpen size={16} className="text-purple-600" />
                                </div>
                                <input
                                  type="text"
                                  value={support.title}
                                  onChange={(e) => updateSupport(index, 'title', e.target.value)}
                                  placeholder="Titre de la section"
                                  className="flex-1 px-3 py-2 bg-white border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
                                />
                                <div className="flex gap-1">
                                  {index > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => moveSupport(index, 'up')}
                                      className="p-2 text-gray-400 hover:text-gray-600"
                                      title="Déplacer vers le haut"
                                    >
                                      <ChevronUp size={16} />
                                    </button>
                                  )}
                                  {index < formData.supports.length - 1 && (
                                    <button
                                      type="button"
                                      onClick={() => moveSupport(index, 'down')}
                                      className="p-2 text-gray-400 hover:text-gray-600"
                                      title="Déplacer vers le bas"
                                    >
                                      <ChevronDown size={16} />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeSupport(index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-2">
                                  <select
                                    value={support.type}
                                    onChange={(e) => updateSupport(index, 'type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                  >
                                    <option value="video">Vidéo</option>
                                    <option value="pdf">PDF</option>
                                    <option value="link">Lien</option>
                                    <option value="quiz">Quiz</option>
                                  </select>
                                </div>

                                <div className="md:col-span-4">
                                  <input
                                    type="text"
                                    value={support.title}
                                    onChange={(e) => updateSupport(index, 'title', e.target.value)}
                                    placeholder="Titre de la ressource"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                  />
                                </div>

                                <div className="md:col-span-4">
                                  <input
                                    type="url"
                                    value={support.url}
                                    onChange={(e) => updateSupport(index, 'url', e.target.value)}
                                    placeholder="URL de la ressource"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                  />
                                </div>

                                <div className="md:col-span-2 flex gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    value={support.duration || ''}
                                    onChange={(e) => updateSupport(index, 'duration', parseInt(e.target.value) || 0)}
                                    placeholder="Durée"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                  />
                                  <div className="flex gap-1">
                                    {index > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => moveSupport(index, 'up')}
                                        className="p-2 text-gray-400 hover:text-gray-600"
                                        title="Déplacer vers le haut"
                                      >
                                        <ChevronUp size={16} />
                                      </button>
                                    )}
                                    {index < formData.supports.length - 1 && (
                                      <button
                                        type="button"
                                        onClick={() => moveSupport(index, 'down')}
                                        className="p-2 text-gray-400 hover:text-gray-600"
                                        title="Déplacer vers le bas"
                                      >
                                        <ChevronDown size={16} />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => removeSupport(index)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>

                                <div className="md:col-span-12">
                                  <textarea
                                    value={support.description || ''}
                                    onChange={(e) => updateSupport(index, 'description', e.target.value)}
                                    placeholder="Description de la ressource (optionnel)"
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Tab */}
              {activeSupportTab === "advanced" && (
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-yellow-800">
                          Configuration avancée
                        </h3>
                        <p className="text-sm text-yellow-700 mt-1">
                          Ces paramètres affectent le comportement du cours. Modifiez-les avec prudence.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Statut de publication
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="isPublished"
                            checked={formData.isPublished === true}
                            onChange={() => setFormData({ ...formData, isPublished: true })}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Publié</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="isPublished"
                            checked={formData.isPublished === false}
                            onChange={() => setFormData({ ...formData, isPublished: false })}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Brouillon</span>
                        </label>
                      </div>
                    </div>

                    {editingCourse && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Métriques du cours
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-gray-600">Inscrits</div>
                            <div className="font-semibold text-gray-900">{editingCourse.enrollmentCount || 0}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-gray-600">Note</div>
                            <div className="font-semibold text-gray-900">
                              {editingCourse.rating > 0 ? editingCourse.rating.toFixed(1) : '-'}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-gray-600">Créé le</div>
                            <div className="font-semibold text-gray-900">
                              {new Date(editingCourse.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-gray-600">Modifié le</div>
                            <div className="font-semibold text-gray-900">
                              {new Date(editingCourse.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  {formData.supports.length} ressources configurées
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    {editingCourse ? (
                      <>
                        <CheckCircle2 size={18} />
                        Mettre à jour
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Créer le cours
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}