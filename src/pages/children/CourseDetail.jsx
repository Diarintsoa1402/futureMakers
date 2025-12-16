/* FICHIER: src/pages/children/CourseDetail.jsx */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById, saveProgress, completeSupport } from "../../services/course";
import { 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  Play, 
  FileText, 
  Link as LinkIcon,
  CheckCircle,
  Award,
  Star,
  Users,
  Download,
  Share2,
  Heart,
  BarChart3,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [currentSupport, setCurrentSupport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("content");
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setIsLoading(true);
      const res = await getCourseById(id);
      if (res.data.success) {
        const courseData = res.data.data;
        setCourse(courseData);
        
        // Stocker la progression utilisateur
        setUserProgress(courseData.userProgress || null);

        if (courseData.supports?.length > 0) {
          setCurrentSupport({ ...courseData.supports[0], index: 0 });
        }

        // Charger les bookmarks depuis le localStorage
        const bookmarks = JSON.parse(localStorage.getItem('courseBookmarks') || '[]');
        setIsBookmarked(bookmarks.includes(courseData.id));
      } else {
        toast.error("Erreur lors du chargement du cours");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement du cours");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSupportComplete = async (supportIndex) => {
    try {
      // Appeler l'API pour marquer le support comme complété
      const result = await completeSupport({
        courseId: id,
        supportIndex: supportIndex
      });

      if (result.data.success) {
        // Mettre à jour la progression locale
        setUserProgress(result.data.data.progress);
        toast.success("Support marqué comme complété !");
        
        // Recharger le cours pour avoir les données fraîches
        loadCourse();
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors du marquage du support");
    }
  };

  const calculateProgress = () => {
    if (!userProgress) return 0;
    return userProgress.percent;
  };

  const markCourseComplete = async () => {
    const progress = calculateProgress();
    try {
      const result = await saveProgress({
        courseId: id,
        status: "completed",
        percent: 100
      });
      
      if (result.data.success) {
        setUserProgress(result.data.data.progress);
        toast.success("🎉 Félicitations ! Cours terminé avec succès !");
        loadCourse(); // Recharger pour mettre à jour la progression
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const startCourse = async () => {
    try {
      const result = await saveProgress({
        courseId: id,
        status: "in_progress",
        percent: 0
      });
      
      if (result.data.success) {
        setUserProgress(result.data.data.progress);
        toast.success("Cours démarré !");
        loadCourse();
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors du démarrage du cours");
    }
  };

  const getSupportIcon = (type) => {
    switch (type) {
      case 'video': return <Play size={20} className="text-red-500" />;
      case 'pdf': return <FileText size={20} className="text-blue-500" />;
      case 'link': return <LinkIcon size={20} className="text-green-500" />;
      case 'quiz': return <BarChart3 size={20} className="text-purple-500" />;
      default: return <BookOpen size={20} className="text-gray-500" />;
    }
  };

  const getSupportDuration = (support) => {
    if (support.duration) return `${support.duration} min`;
    if (support.type === 'video') return 'Video';
    if (support.type === 'pdf') return 'PDF';
    if (support.type === 'quiz') return 'Quiz';
    return 'Ressource';
  };

  const isSupportCompleted = (supportIndex) => {
    // Pour l'instant, on utilise une logique simple basée sur le pourcentage
    // Vous pourrez améliorer cela quand vous ajouterez completedSupports au modèle
    if (!userProgress) return false;
    
    const totalSupports = course?.supports?.length || 0;
    if (totalSupports === 0) return false;
    
    const progressPerSupport = 100 / totalSupports;
    const expectedProgress = (supportIndex + 1) * progressPerSupport;
    
    return userProgress.percent >= expectedProgress;
  };

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('courseBookmarks') || '[]');
    let newBookmarks;
    
    if (isBookmarked) {
      newBookmarks = bookmarks.filter(bookmarkId => bookmarkId !== course.id);
      toast.success("Cours retiré des favoris");
    } else {
      newBookmarks = [...bookmarks, course.id];
      toast.success("Cours ajouté aux favoris");
    }
    
    localStorage.setItem('courseBookmarks', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  const shareCourse = async () => {
    const shareUrl = `${window.location.origin}/child/courses/${id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: course.title,
          text: course.description,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Erreur de partage:', err);
      }
    } else {
      // Fallback pour copier dans le clipboard
      navigator.clipboard.writeText(shareUrl);
      toast.success("Lien copié dans le presse-papier !");
    }
  };

  const downloadSupport = (support) => {
    if (support.type === 'pdf' && support.url) {
      window.open(support.url, '_blank');
    } else {
      toast.error("Téléchargement non disponible pour ce type de support");
    }
  };

  const toggleSection = (index) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const groupSupportsBySection = () => {
    if (!course?.supports) return [];
    
    const sections = [];
    let currentSection = null;
    
    course.supports.forEach((support, index) => {
      if (support.isSectionHeader) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: support.title,
          supports: []
        };
      } else if (currentSection) {
        currentSection.supports.push({ ...support, index });
      } else {
        // Si pas de section header, créer une section par défaut
        if (sections.length === 0) {
          sections.push({
            title: "Contenu du cours",
            supports: []
          });
        }
        sections[0].supports.push({ ...support, index });
      }
    });
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du cours...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cours introuvable</h2>
          <p className="text-gray-600 mb-6">Le cours que vous recherchez n'existe pas ou a été supprimé.</p>
          <button
            onClick={() => navigate('/child/courses')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retour aux cours
          </button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const sections = groupSupportsBySection();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/child/courses')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              Retour aux cours
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
                title={isBookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart size={20} fill={isBookmarked ? "currentColor" : "none"} />
              </button>
              
              <button
                onClick={shareCourse}
                className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Partager ce cours"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {course.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  course.difficulty === 'débutant' 
                    ? 'bg-green-100 text-green-700'
                    : course.difficulty === 'intermédiaire'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {course.difficulty}
                </span>
                {course.rating > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{course.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>
              
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <span>{course.duration} minutes total</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={18} />
                  <span>{course.supports?.length || 0} ressources</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  <span>{course.enrollmentCount || 0} apprenants</span>
                </div>
                {course.instructor && (
                  <div className="text-sm text-gray-600">
                    Par <span className="font-medium">{course.instructor}</span>
                  </div>
                )}
              </div>

              {/* Objectifs d'apprentissage */}
              {course.objectives && course.objectives.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Ce que vous allez apprendre :</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {course.objectives.map((objective, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {course.thumbnail && (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full lg:w-80 h-48 lg:h-56 object-cover rounded-xl shadow-lg"
              />
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Votre progression
              </span>
              <span className="text-sm font-bold text-indigo-600">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            {!userProgress && (
              <div className="mt-4">
                <button
                  onClick={startCourse}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Commencer ce cours
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Supports List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Contenu du cours
                </h2>
                <span className="text-sm text-gray-500">
                  {progress}% complété
                </span>
              </div>

              {!course.supports || course.supports.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucune ressource disponible
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleSection(sectionIndex)}
                        className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-900">{section.title}</span>
                        {expandedSections.has(sectionIndex) ? (
                          <ChevronUp size={16} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-500" />
                        )}
                      </button>
                      
                      {expandedSections.has(sectionIndex) && (
                        <div className="p-2 space-y-1">
                          {section.supports.map((support) => (
                            <button
                              key={support.index}
                              onClick={() => setCurrentSupport(support)}
                              className={`w-full text-left p-3 rounded-lg transition-all ${
                                currentSupport?.index === support.index
                                  ? 'bg-indigo-50 border-2 border-indigo-500'
                                  : 'bg-white border-2 border-transparent hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`mt-1 ${currentSupport?.index === support.index ? 'text-indigo-600' : 'text-gray-400'}`}>
                                  {getSupportIcon(support.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm truncate">
                                    {support.title}
                                  </p>
                                  <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-gray-500 capitalize">
                                      {support.type}
                                    </p>
                                    <span className="text-xs text-gray-400">
                                      {getSupportDuration(support)}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSupportComplete(support.index);
                                  }}
                                  className={`flex-shrink-0 ${
                                    isSupportCompleted(support.index)
                                      ? 'text-green-600'
                                      : 'text-gray-300'
                                  }`}
                                  disabled={!userProgress}
                                >
                                  <CheckCircle 
                                    size={20} 
                                    fill={isSupportCompleted(support.index) ? 'currentColor' : 'none'} 
                                  />
                                </button>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {userProgress && (
                <button
                  onClick={markCourseComplete}
                  disabled={progress === 100}
                  className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Award size={20} />
                  {progress === 100 ? 'Cours Terminé 🎉' : 'Marquer comme terminé'}
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab("content")}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === "content"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Contenu
                  </button>
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === "overview"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Aperçu
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "content" && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {currentSupport ? (
                  <>
                    <div className="border-b border-gray-200 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {currentSupport.title}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize mt-1">
                            Type: {currentSupport.type}
                            {currentSupport.duration && ` • ${currentSupport.duration} minutes`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {userProgress && (
                            <button
                              onClick={() => toggleSupportComplete(currentSupport.index)}
                              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${
                                isSupportCompleted(currentSupport.index)
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              <CheckCircle size={16} />
                              {isSupportCompleted(currentSupport.index) ? 'Complété' : 'Marquer comme complété'}
                            </button>
                          )}
                          {currentSupport.type === 'pdf' && (
                            <button
                              onClick={() => downloadSupport(currentSupport)}
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Télécharger"
                            >
                              <Download size={20} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {currentSupport.description && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                          <p className="text-blue-800 text-sm">{currentSupport.description}</p>
                        </div>
                      )}

                      {currentSupport.type === 'video' && (
                        <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                          <iframe
                            src={currentSupport.url}
                            className="w-full h-full"
                            allowFullScreen
                            title={currentSupport.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                        </div>
                      )}

                      {currentSupport.type === 'pdf' && (
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-lg">
                          <iframe
                            src={currentSupport.url}
                            className="w-full h-full"
                            title={currentSupport.title}
                          />
                        </div>
                      )}

                      {currentSupport.type === 'link' && (
                        <div className="text-center py-12">
                          <LinkIcon size={64} className="mx-auto text-gray-400 mb-4" />
                          <h4 className="text-2xl font-bold text-gray-900 mb-2">
                            Ressource externe
                          </h4>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            {currentSupport.description || "Cliquez sur le bouton ci-dessous pour accéder à la ressource externe."}
                          </p>
                          <a
                            href={currentSupport.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition-colors text-lg font-medium"
                          >
                            Ouvrir le lien
                            <LinkIcon size={20} />
                          </a>
                        </div>
                      )}

                      {currentSupport.type === 'quiz' && (
                        <div className="text-center py-12">
                          <BarChart3 size={64} className="mx-auto text-gray-400 mb-4" />
                          <h4 className="text-2xl font-bold text-gray-900 mb-2">
                            Quiz interactif
                          </h4>
                          <p className="text-gray-600 mb-6">
                            {currentSupport.description || "Ce quiz vous aidera à tester vos connaissances sur le sujet."}
                          </p>
                          <a
                            href={currentSupport.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
                          >
                            Commencer le quiz
                            <BarChart3 size={20} />
                          </a>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center">
                    <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {userProgress ? 'Bienvenue dans le cours !' : 'Prêt à commencer ?'}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {userProgress 
                        ? "Sélectionnez une ressource dans la liste pour commencer votre apprentissage."
                        : "Commencez le cours pour accéder au contenu et suivre votre progression."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      {!userProgress ? (
                        <button
                          onClick={startCourse}
                          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Commencer le cours
                        </button>
                      ) : (
                        <button
                          onClick={() => setCurrentSupport({ ...course.supports[0], index: 0 })}
                          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Commencer le premier module
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "overview" && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">À propos de ce cours</h3>
                
                <div className="prose max-w-none text-gray-700">
                  <p className="text-lg leading-relaxed mb-6">
                    {course.description}
                  </p>

                  {course.objectives && course.objectives.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">
                        Objectifs d'apprentissage
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {course.objectives.map((objective, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">
                        Informations du cours
                      </h4>
                      <dl className="space-y-3">
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Catégorie</dt>
                          <dd className="font-medium">{course.category}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Niveau</dt>
                          <dd className="font-medium capitalize">{course.difficulty}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Durée totale</dt>
                          <dd className="font-medium">{course.duration} minutes</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Ressources</dt>
                          <dd className="font-medium">{course.supports?.length || 0} modules</dd>
                        </div>
                        {course.instructor && (
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Instructeur</dt>
                            <dd className="font-medium">{course.instructor}</dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">
                        Statistiques
                      </h4>
                      <dl className="space-y-3">
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Apprenants inscrits</dt>
                          <dd className="font-medium">{course.enrollmentCount || 0}</dd>
                        </div>
                        {course.rating > 0 && (
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Note moyenne</dt>
                            <dd className="font-medium flex items-center gap-1">
                              <Star size={16} className="fill-yellow-400 text-yellow-400" />
                              {course.rating.toFixed(1)}/5
                            </dd>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Votre progression</dt>
                          <dd className="font-medium text-indigo-600">{progress}%</dd>
                        </div>
                      </dl>
                    </div>
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