import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getFormationDetails,
  completeModule,
  getProgress,
  downloadCertificate
} from "../../services/formationService";
import ProgressBar from "../../components/ProgressBar";
import {
  ArrowLeft,
  PlayCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  Download,
  Award,
  Target,
  FileText,
  Video,
  BookMarked,
  ChevronRight,
  Crown,
  Star,
  Users,
  Calendar,
  BarChart3,
  Loader2,
  AlertCircle,
  ExternalLink
} from "lucide-react";

// Composant Skeleton pour le chargement
const FormationDetailSkeleton = () => (
  <div className="max-w-6xl mx-auto p-6 animate-pulse">
    <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-2/3 mb-6"></div>
    <div className="h-6 bg-gray-300 rounded w-48 mb-8"></div>
    <div className="space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-24 bg-gray-300 rounded"></div>
      ))}
    </div>
  </div>
);

// Composant Error State
const ErrorState = ({ error, onRetry }) => (
  <div className="max-w-2xl mx-auto p-8 text-center">
    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertCircle className="w-10 h-10 text-red-600" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">Erreur</h3>
    <p className="text-gray-600 mb-6">{error}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-colors"
    >
      <Loader2 className="w-5 h-5" />
      Réessayer
    </button>
  </div>
);

// Composant Module Card
const ModuleCard = ({ 
  module, 
  index, 
  isCompleted, 
  onComplete, 
  isCompleting,
  enrollmentId 
}) => {
  const getContentIcon = (contentType) => {
    const icons = {
      video: Video,
      pdf: FileText,
      article: BookMarked,
      quiz: BookOpen,
      exercise: Target
    };
    const IconComponent = icons[contentType] || FileText;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className={`
      group bg-white p-6 rounded-xl border-2 transition-all duration-300
      ${isCompleted 
        ? "border-green-200 bg-green-50" 
        : "border-gray-200 hover:border-purple-300 hover:shadow-lg"
      }
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
              ${isCompleted 
                ? "bg-green-500 text-white" 
                : "bg-purple-100 text-purple-600"
              }
            `}>
              {isCompleted ? "✓" : index + 1}
            </div>
            <h3 className={`text-lg font-semibold ${isCompleted ? "text-green-800" : "text-gray-900"}`}>
              {module.title}
            </h3>
            {isCompleted && (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            )}
          </div>

          <p className="text-gray-600 mb-4 leading-relaxed">
            {module.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              {getContentIcon(module.contentType)}
              <span className="capitalize">{module.contentType}</span>
            </span>
            
            {module.duration && (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {module.duration} min
              </span>
            )}
            
            {module.estimatedTime && (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {module.estimatedTime}
              </span>
            )}
          </div>

          {module.contentUrl && !isCompleted && (
            <a
              href={module.contentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Accéder au contenu
            </a>
          )}
        </div>

        {!isCompleted && (
          <button
            onClick={() => onComplete(module.id)}
            disabled={isCompleting === module.id}
            className={`
              ml-4 px-6 py-3 rounded-lg font-medium transition-all duration-200
              flex items-center gap-2 whitespace-nowrap
              ${isCompleting === module.id
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-sm hover:shadow-md"
              }
            `}
          >
            {isCompleting === module.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <PlayCircle className="w-4 h-4" />
            )}
            {isCompleting === module.id ? "Marquage..." : "Commencer"}
          </button>
        )}
      </div>

      {/* Badge de progression */}
      {isCompleted && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-green-200">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-600 font-medium">
            Terminé le {new Date().toLocaleDateString('fr-FR')}
          </span>
        </div>
      )}
    </div>
  );
};

// Composant Stats Card
const StatsCard = ({ icon: Icon, label, value, color = "purple" }) => {
  const colors = {
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600"
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{label}</div>
        </div>
      </div>
    </div>
  );
};

export default function FormationDetail() {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completingModule, setCompletingModule] = useState(null);
  const [downloadingCert, setDownloadingCert] = useState(false);

  useEffect(() => {
    loadDetails();
  }, [enrollmentId]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const [detailsRes, progressRes] = await Promise.all([
        getFormationDetails(enrollmentId),
        getProgress(enrollmentId)
      ]);
      setEnrollment(detailsRes.data.enrollment);
      setStats(progressRes.data.stats);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement des détails de la formation");
      console.error('Erreur détail formation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteModule = async (moduleId) => {
    try {
      setCompletingModule(moduleId);
      await completeModule(enrollmentId, moduleId, {
        timeSpent: 0,
        notes: ""
      });
      
      // Recharger les données
      await loadDetails();
      
      // Notification de succès
      if (window.toast) {
        window.toast.success("Module complété avec succès !");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Erreur lors de la complétion du module";
      if (window.toast) {
        window.toast.error(errorMsg);
      } else {
        alert(errorMsg);
      }
    } finally {
      setCompletingModule(null);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!stats?.certificateUrl) return;
    
    try {
      setDownloadingCert(true);
      const certificateUrl = await downloadCertificate(enrollmentId);
      
      const link = document.createElement('a');
      link.href = certificateUrl;
      link.download = `certificat-${enrollment?.Formation?.title}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (window.toast) {
        window.toast.success("Certificat téléchargé avec succès !");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Erreur lors du téléchargement";
      if (window.toast) {
        window.toast.error(errorMsg);
      } else {
        alert(errorMsg);
      }
    } finally {
      setDownloadingCert(false);
    }
  };

  const isModuleCompleted = (moduleId) => {
    return enrollment?.moduleProgress?.some(
      p => p.moduleId === moduleId && p.isCompleted
    );
  };

  const getNextIncompleteModule = () => {
    if (!enrollment?.Formation?.modules) return null;
    return enrollment.Formation.modules.find(
      module => !isModuleCompleted(module.id)
    );
  };

  if (loading) return <FormationDetailSkeleton />;
  if (error) return <ErrorState error={error} onRetry={loadDetails} />;
  if (!enrollment) return <div className="p-8 text-center">Formation introuvable</div>;

  const formation = enrollment.Formation;
  const nextModule = getNextIncompleteModule();
  const allModulesCompleted = enrollment.progress === 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header avec navigation */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {formation.title}
                  </h1>
                  {allModulesCompleted && (
                    <Crown className="w-8 h-8 text-amber-500" />
                  )}
                </div>
                
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  {formation.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    {formation.category}
                  </span>
                  <span className="px-3 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {formation.level}
                  </span>
                  {formation.tags?.map((tag, index) => (
                    <span key={index} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Barre de progression */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progression globale
                    </span>
                    <span className="text-sm font-bold text-purple-600">
                      {enrollment.progress}%
                    </span>
                  </div>
                  <ProgressBar 
                    percent={enrollment.progress} 
                    variant={allModulesCompleted ? "success" : "primary"}
                    showLabel={false}
                    height="h-3"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>
                      {stats?.completedModules || 0} sur {stats?.totalModules || 0} modules complétés
                    </span>
                    {stats?.progressLevel && (
                      <span className="font-medium">{stats.progressLevel}</span>
                    )}
                  </div>
                </div>

                {/* Bouton d'action principal */}
                {nextModule && (
                  <button
                    onClick={() => {
                      document.getElementById(`module-${nextModule.id}`)?.scrollIntoView({
                        behavior: 'smooth'
                      });
                    }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Continuer avec "{nextModule.title}"
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                {allModulesCompleted && stats?.certificateUrl && (
                  <button
                    onClick={handleDownloadCertificate}
                    disabled={downloadingCert}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {downloadingCert ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    Télécharger mon certificat
                  </button>
                )}
              </div>

              {/* Métadonnées */}
              <div className="lg:w-80 space-y-4">
                <StatsCard
                  icon={BookOpen}
                  label="Modules"
                  value={`${stats?.completedModules || 0}/${stats?.totalModules || 0}`}
                  color="purple"
                />
                <StatsCard
                  icon={Clock}
                  label="Durée totale"
                  value={`${formation.duration}h`}
                  color="blue"
                />
                <StatsCard
                  icon={Calendar}
                  label="Début"
                  value={new Date(enrollment.startedAt).toLocaleDateString('fr-FR')}
                  color="amber"
                />
                {enrollment.completedAt && (
                  <StatsCard
                    icon={Award}
                    label="Terminé le"
                    value={new Date(enrollment.completedAt).toLocaleDateString('fr-FR')}
                    color="green"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Objectifs */}
            {formation.objectives && formation.objectives.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-purple-600" />
                  Objectifs d'apprentissage
                </h2>
                <ul className="space-y-3">
                  {formation.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modules */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BookMarked className="w-6 h-6 text-purple-600" />
                  Modules de formation
                </h2>
                <div className="text-sm text-gray-600">
                  {stats?.completedModules || 0} sur {stats?.totalModules || 0} complétés
                </div>
              </div>

              {formation.modules && formation.modules.length > 0 ? (
                <div className="space-y-4">
                  {formation.modules.map((module, index) => (
                    <div key={module.id} id={`module-${module.id}`}>
                      <ModuleCard
                        module={module}
                        index={index}
                        isCompleted={isModuleCompleted(module.id)}
                        onComplete={handleCompleteModule}
                        isCompleting={completingModule}
                        enrollmentId={enrollmentId}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun module disponible pour le moment</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progression détaillée */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Progression détaillée</h3>
              <div className="space-y-3">
                {formation.modules?.map((module) => {
                  const completed = isModuleCompleted(module.id);
                  return (
                    <div key={module.id} className="flex items-center justify-between">
                      <span className={`text-sm ${completed ? 'text-green-600' : 'text-gray-600'}`}>
                        {module.title}
                      </span>
                      {completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ressources supplémentaires */}
            {(formation.resources || formation.instructor) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Informations</h3>
                <div className="space-y-3">
                  {formation.instructor && (
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Formateur: {formation.instructor}</span>
                    </div>
                  )}
                  {formation.resources?.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {resource.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}