import { useEffect, useState, useCallback } from "react";
import { Briefcase, Edit3, Save, X, Trash2, TrendingUp, Calendar, DollarSign, AlertCircle, CheckCircle, Loader, Sparkles, Plus, Eye, Search, BarChart3, MessageSquare, Clock } from "lucide-react";
import { getMyProjects, createProject, updateProject, deleteProject, createProjectUpdate, getProjectUpdates, deleteProjectUpdate } from "../../services/project";

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    fundingRequested: ""
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });

  // États pour les mises à jour de progression
  const [projectUpdates, setProjectUpdates] = useState([]);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [progressForm, setProgressForm] = useState({
    progress: "",
    updateNote: ""
  });
  const [progressErrors, setProgressErrors] = useState({});

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await getMyProjects();
      console.log('Réponse API getMyProjects:', data);
      const list = Array.isArray(data) ? data : (data.projects || []);
      setProjects(list);
      setFilteredProjects(list);
    } catch (err) {
      console.error('Erreur API getMyProjects:', err);
      showMessage("error", "Erreur lors du chargement des projets");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { 
    loadProjects(); 
  }, [loadProjects]);

  useEffect(() => {
    let filtered = Array.isArray(projects) ? projects : [];
    // Filtre par statut
    if (filterStatus !== "all") {
      filtered = filtered.filter(p => p.status === filterStatus);
    }
    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProjects(Array.isArray(filtered) ? filtered : []);
  }, [searchTerm, filterStatus, projects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.title?.trim()) {
      newErrors.title = "Le titre est requis";
    } else if (form.title.length < 5) {
      newErrors.title = "Le titre doit contenir au moins 5 caractères";
    } else if (form.title.length > 100) {
      newErrors.title = "Le titre ne peut pas dépasser 100 caractères";
    }

    if (!form.description?.trim()) {
      newErrors.description = "La description est requise";
    } else if (form.description.length < 20) {
      newErrors.description = "La description doit contenir au moins 20 caractères";
    } else if (form.description.length > 2000) {
      newErrors.description = "La description ne peut pas dépasser 2000 caractères";
    }

    const funding = parseFloat(form.fundingRequested);
    if (!form.fundingRequested || isNaN(funding)) {
      newErrors.fundingRequested = "Le montant demandé est requis";
    } else if (funding < 10000) {
      newErrors.fundingRequested = "Le montant minimum est de 10 000 Ar";
    } else if (funding > 100000000) {
      newErrors.fundingRequested = "Le montant maximum est de 100 000 000 Ar";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showMessage("error", "Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    try {
      setIsSaving(true);
      const formData = {
        ...form,
        fundingRequested: parseFloat(form.fundingRequested)
      };

      if (isEditing && selectedProject) {
        const { data } = await updateProject(selectedProject.id, formData);
        console.log('Réponse API updateProject:', data);
        const updated = data?.data || data;
        setProjects(projects.map(p => p.id === updated.id ? updated : p));
        showMessage("success", "Projet mis à jour avec succès !");
      } else {
        const { data } = await createProject(formData);
        console.log('Réponse API createProject:', data);
        const created = data?.data || data;
        setProjects([created, ...projects]);
        showMessage("success", "Projet créé avec succès !");
      }
      
      handleCancelForm();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Erreur lors de l'enregistrement";
      showMessage("error", errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setIsEditing(true);
    setIsCreating(false);
    setForm({
      title: project.title,
      description: project.description,
      fundingRequested: project.fundingRequested
    });
  };

  const handleDelete = async (projectId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) return;
    
    try {
      await deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      showMessage("success", "Projet supprimé avec succès");
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
    } catch {
      showMessage("error", "Erreur lors de la suppression");
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedProject(null);
    setForm({ title: "", description: "", fundingRequested: "" });
    setErrors({});
  };

  const handleCancelForm = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedProject(null);
    setForm({ title: "", description: "", fundingRequested: "" });
    setErrors({});
  };

  const handleProgressChange = (e) => {
    const { name, value } = e.target;
    setProgressForm({ ...progressForm, [name]: value });
    if (progressErrors[name]) {
      setProgressErrors({ ...progressErrors, [name]: "" });
    }
  };

  const validateProgressForm = () => {
    const newErrors = {};

    const progressStr = progressForm.progress?.toString().trim();
    const progress = parseInt(progressStr);
    if (!progressStr || isNaN(progress)) {
      newErrors.progress = "La progression est requise";
    } else if (progress < 0 || progress > 100) {
      newErrors.progress = "La progression doit être entre 0 et 100";
    }

    setProgressErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProgress = async () => {
    if (!validateProgressForm()) {
      showMessage("error", "Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    try {
      setIsUpdatingProgress(true);
      const formData = {
        progress: parseInt(progressForm.progress),
        updateNote: progressForm.updateNote?.trim() || null
      };

      console.log('📤 Envoi createProjectUpdate:', { projectId: selectedProject.id, ...formData });

      const { data } = await createProjectUpdate(selectedProject.id, formData);
      console.log('📥 Réponse API createProjectUpdate:', data);

      const updatesResponse = await getProjectUpdates(selectedProject.id);
      setProjectUpdates(updatesResponse.data.updates || []);

      await loadProjects();

      setSelectedProject({
        ...selectedProject,
        progress: parseInt(progressForm.progress)
      });

      showMessage("success", "Progression mise à jour avec succès !");
      setShowProgressForm(false);
      setProgressForm({ progress: "", updateNote: "" });
      setProgressErrors({});
    } catch (err) {
      console.error('❌ Erreur handleSaveProgress:', err);
      console.error('Response details:', err.response?.data, err.response?.status);
      const errorMsg = err.response?.data?.message || "Erreur lors de la mise à jour de la progression";
      showMessage("error", errorMsg);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleDeleteUpdate = async (updateId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette mise à jour ?")) return;

    try {
      await deleteProjectUpdate(updateId);
      setProjectUpdates(projectUpdates.filter(u => u.id !== updateId));
      showMessage("success", "Mise à jour supprimée avec succès");
    } catch (err) {
      showMessage("error", "Erreur lors de la suppression");
    }
  };

  const handleViewDetails = async (project) => {
    console.log('Chargement détails pour project.id:', project.id);
    setSelectedProject(project);
    setIsCreating(false);
    setIsEditing(false);

    try {
      const { data } = await getProjectUpdates(project.id);
      setProjectUpdates(data.updates || []);
    } catch (err) {
      console.error('Erreur chargement mises à jour:', err);
      setProjectUpdates([]);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MG').format(amount);
  };

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
        icon: "✨"
      },
      "refusé": { 
        bg: "from-rose-500 to-red-500", 
        badge: "bg-rose-100 text-rose-800 border-rose-200",
        icon: "⚠️"
      },
      "terminé": { 
        bg: "from-slate-500 to-gray-500", 
        badge: "bg-slate-100 text-slate-800 border-slate-200",
        icon: "🏁"
      }
    };
    return configs[status] || configs["en cours"];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-32">
            <div className="text-center space-y-4">
              <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
              <p className="text-gray-600 text-lg">Chargement de vos projets...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Mes Projets</h1>
                <p className="text-gray-600 text-lg">
                  {projects.length} projet{projects.length > 1 ? 's' : ''} au total
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Nouveau Projet
            </button>
          </div>

          {/* Filtres et recherche */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex gap-2">
              {["all", "en cours", "validé", "refusé", "terminé"].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    filterStatus === status
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  {status === "all" ? "Tous" : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={`mb-6 p-5 rounded-2xl border-2 ${
            message.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}>
            <div className="flex items-center gap-3">
              {message.type === "success" ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
              <span className="font-semibold text-lg">{message.text}</span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Liste des projets */}
          <div className="lg:col-span-1 space-y-4">
            {Array.isArray(filteredProjects) && filteredProjects.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Aucun projet trouvé</p>
                <button
                  onClick={handleCreateNew}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-all"
                >
                  Créer votre premier projet
                </button>
              </div>
            ) : (
              (Array.isArray(filteredProjects) ? filteredProjects : []).map(project => (
                <div
                  key={project.id}
                  onClick={() => handleViewDetails(project)}
                  className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-sm ${
                    selectedProject?.id === project.id
                      ? "border-blue-500 shadow-lg shadow-blue-500/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-2">{project.title}</h3>
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getStatusConfig(project.status).badge}`}>
                      {getStatusConfig(project.status).icon}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${getStatusConfig(project.status).bg} transition-all duration-500`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{project.progress}% complété</span>
                      <span className="text-blue-600 font-semibold">{formatCurrency(project.fundingRequested)} Ar</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Détails / Formulaire */}
          <div className="lg:col-span-2">
            {isCreating || isEditing ? (
              /* Formulaire */
              <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                    {isEditing ? <Edit3 className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {isEditing ? "Modifier le projet" : "Créer un nouveau projet"}
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Titre */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Titre du projet <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Ex: Atelier de couture artisanale"
                      className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.title ? "border-rose-500 bg-rose-50" : "border-gray-300"
                      }`}
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-rose-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.title}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      {form.title.length}/100 caractères
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Description détaillée <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Décrivez votre projet en détail..."
                      rows="6"
                      className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                        errors.description ? "border-rose-500 bg-rose-50" : "border-gray-300"
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-2 text-sm text-rose-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      {form.description.length}/2000 caractères
                    </p>
                  </div>

                  {/* Montant */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Montant demandé (Ar) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="number"
                        name="fundingRequested"
                        value={form.fundingRequested}
                        onChange={handleChange}
                        placeholder="5000000"
                        className={`w-full pl-12 pr-5 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.fundingRequested ? "border-rose-500 bg-rose-50" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.fundingRequested && (
                      <p className="mt-2 text-sm text-rose-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.fundingRequested}
                      </p>
                    )}
                    {form.fundingRequested && !errors.fundingRequested && (
                      <p className="mt-2 text-sm text-emerald-600 font-semibold">
                        💰 {formatCurrency(form.fundingRequested)} Ar
                      </p>
                    )}
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex gap-4 mt-10 pt-8 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-blue-400 disabled:to-cyan-400 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] disabled:scale-100"
                  >
                    {isSaving ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>{isEditing ? "Enregistrer" : "Créer le projet"}</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleCancelForm}
                    disabled={isSaving}
                    className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 hover:text-gray-900 font-bold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 border border-gray-300"
                  >
                    <X className="w-5 h-5" />
                    Annuler
                  </button>
                </div>
              </div>
            ) : selectedProject ? (
              /* Détails du projet */
              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                {/* Formulaire de mise à jour de progression */}
                {showProgressForm && (
                  <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 m-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Mettre à jour la progression
                      </h3>
                    </div>

                    <div className="space-y-6">
                      {/* Progression actuelle */}
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Progression actuelle</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-100 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${selectedProject.progress}%` }}
                            />
                          </div>
                          <span className="text-gray-900 font-bold">{selectedProject.progress}%</span>
                        </div>
                      </div>

                      {/* Nouvelle progression */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Nouvelle progression (%) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="progress"
                          value={progressForm.progress}
                          onChange={handleProgressChange}
                          placeholder="Ex: 75"
                          min="0"
                          max="100"
                          className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            progressErrors.progress ? "border-rose-500 bg-rose-50" : "border-gray-300"
                          }`}
                        />
                        {progressErrors.progress && (
                          <p className="mt-2 text-sm text-rose-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {progressErrors.progress}
                          </p>
                        )}
                      </div>

                      {/* Note de mise à jour */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Note de mise à jour (optionnel)
                        </label>
                        <textarea
                          name="updateNote"
                          value={progressForm.updateNote}
                          onChange={handleProgressChange}
                          placeholder="Décrivez ce qui a été fait pour atteindre cette progression..."
                          rows="3"
                          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          {progressForm.updateNote?.length || 0}/500 caractères
                        </p>
                      </div>
                    </div>

                    {/* Boutons */}
                    <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                      <button
                        onClick={handleSaveProgress}
                        disabled={isUpdatingProgress}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-blue-400 disabled:to-cyan-400 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] disabled:scale-100"
                      >
                        {isUpdatingProgress ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            <span>Mise à jour...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            <span>Mettre à jour</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setShowProgressForm(false);
                          setProgressForm({ progress: "", updateNote: "" });
                          setProgressErrors({});
                        }}
                        disabled={isUpdatingProgress}
                        className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 hover:text-gray-900 font-bold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 border border-gray-300"
                      >
                        <X className="w-5 h-5" />
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                {/* Historique des mises à jour */}
                {projectUpdates.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 m-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Historique des mises à jour
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {projectUpdates.map((update) => (
                        <div key={update.id} className="bg-white rounded-xl p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-gray-900 font-semibold">
                                  Progression mise à jour à {update.progress}%
                                </p>
                                <p className="text-gray-600 text-sm">
                                  Par {update.UpdatedBy?.firstName} {update.UpdatedBy?.lastName} • {new Date(update.createdAt).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteUpdate(update.id)}
                              className="text-gray-400 hover:text-rose-500 transition-colors"
                              title="Supprimer cette mise à jour"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {update.updateNote && (
                            <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {update.updateNote}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* En-tête */}
                <div className={`bg-gradient-to-r ${getStatusConfig(selectedProject.status).bg} p-8 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-3xl font-bold text-white">{selectedProject.title}</h2>
                      <Sparkles className="w-8 h-8 text-white/80" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 rounded-full font-semibold border-2 backdrop-blur-sm ${getStatusConfig(selectedProject.status).badge}`}>
                        <span className="mr-2">{getStatusConfig(selectedProject.status).icon}</span>
                        {selectedProject.status}
                      </span>
                      <span className="px-4 py-2 rounded-full font-semibold bg-white/20 text-white backdrop-blur-sm border-2 border-white/30">
                        <TrendingUp className="w-4 h-4 inline mr-2" />
                        {selectedProject.progress}% complété
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="px-8 pt-6">
                  <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getStatusConfig(selectedProject.status).bg} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                      style={{ width: `${selectedProject.progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-8 space-y-6">
                  <div>
                    <label className="text-sm font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                      Description du projet
                    </label>
                    <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap bg-gray-50 p-5 rounded-xl border border-gray-200">
                      {selectedProject.description}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-4">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <label className="text-sm font-bold text-blue-700 uppercase tracking-wide">
                          Montant demandé
                        </label>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(selectedProject.fundingRequested)} <span className="text-xl text-gray-600">Ar</span>
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-2xl border border-cyan-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-cyan-100">
                          <Calendar className="w-5 h-5 text-cyan-600" />
                        </div>
                        <label className="text-sm font-bold text-cyan-700 uppercase tracking-wide">
                          Créé le
                        </label>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Date(selectedProject.createdAt).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(selectedProject)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02]"
                    >
                      <Edit3 className="w-5 h-5" />
                      Modifier
                    </button>
                    <button
                      onClick={() => setShowProgressForm(true)}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02]"
                    >
                      <BarChart3 className="w-5 h-5" />
                      Mettre à jour progression
                    </button>
                    <button
                      onClick={() => handleDelete(selectedProject.id)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-bold px-6 py-4 rounded-xl transition-all duration-300 border border-rose-200 hover:border-rose-300 flex items-center justify-center gap-3"
                    >
                      <Trash2 className="w-5 h-5" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* État vide - Aucun projet sélectionné */
              <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm">
                <div className="max-w-md mx-auto space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-3xl opacity-10"></div>
                    <Briefcase className="w-24 h-24 text-gray-400 mx-auto relative" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900">Sélectionnez un projet</h3>
                    <p className="text-gray-600 text-lg">
                      Choisissez un projet dans la liste pour voir les détails
                    </p>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={handleCreateNew}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105"
                    >
                      <Plus className="w-5 h-5" />
                      Créer un nouveau projet
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}