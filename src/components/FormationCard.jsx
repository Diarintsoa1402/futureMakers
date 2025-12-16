import React, { useState } from "react";
import { 
  Clock, 
  Users, 
  Star, 
  PlayCircle, 
  BookOpen,
  Calendar,
  TrendingUp,
  Award
} from "lucide-react";

// Composant Badge réutilisable
const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    primary: "bg-indigo-100 text-indigo-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    premium: "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Composant Skeleton pour le chargement
export const FormationCardSkeleton = () => (
  <div className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white animate-pulse">
    <div className="w-full h-40 bg-gray-300 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-300 rounded mb-3 w-3/4"></div>
    <div className="h-3 bg-gray-300 rounded mb-2 w-1/2"></div>
    <div className="h-3 bg-gray-300 rounded mb-4 w-full"></div>
    <div className="flex gap-2 mb-4">
      <div className="h-6 bg-gray-300 rounded-full w-16"></div>
      <div className="h-6 bg-gray-300 rounded-full w-20"></div>
    </div>
    <div className="h-10 bg-gray-300 rounded-lg"></div>
  </div>
);

// Composant principal FormationCard
export default function FormationCard({ 
  formation, 
  onAction, 
  actionLabel = "Commencer", 
  showEnrolled = false,
  showProgress = false,
  progress = 0,
  variant = "default",
  isLoading = false
}) {
  const [imageError, setImageError] = useState(false);

  if (isLoading) {
    return <FormationCardSkeleton />;
  }

  const {
    imageUrl,
    title,
    category,
    level,
    description,
    duration,
    enrollments = [],
    maxParticipants,
    instructor,
    rating,
    totalLessons,
    startDate,
    isFeatured = false,
    isNew = false,
    difficulty
  } = formation;

  const enrollmentCount = enrollments.length;
  const isFull = maxParticipants && enrollmentCount >= maxParticipants;
  const canEnroll = !isFull || !showEnrolled;

  // Déterminer la variante de couleur basée sur le niveau
  const getLevelVariant = () => {
    switch (level?.toLowerCase()) {
      case 'débutant': return 'success';
      case 'intermédiaire': return 'warning';
      case 'avancé': return 'danger';
      case 'expert': return 'premium';
      default: return 'default';
    }
  };

  // Formatage de la date
  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calcul du pourcentage de complétion
  const progressPercentage = showProgress ? Math.min(Math.max(progress, 0), 100) : 0;

  return (
    <div className={`
      group relative border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg 
      transition-all duration-300 bg-white overflow-hidden
      ${variant === 'featured' || isFeatured ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}
      ${!canEnroll ? 'opacity-75' : 'hover:scale-[1.02]'}
    `}>
      {/* Badges spéciaux */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {isFeatured && (
          <Badge variant="premium" className="shadow-sm">
            <TrendingUp className="w-3 h-3 mr-1" />
            Populaire
          </Badge>
        )}
        {isNew && (
          <Badge variant="success" className="shadow-sm">
            Nouveau
          </Badge>
        )}
        {isFull && showEnrolled && (
          <Badge variant="danger" className="shadow-sm">
            Complet
          </Badge>
        )}
      </div>

      {/* Image avec fallback */}
      <div className="relative w-full h-40 rounded-lg mb-4 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <BookOpen className="w-12 h-12" />
          </div>
        )}
        
        {/* Overlay de progression */}
        {showProgress && progressPercentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>

      {/* En-tête avec titre et rating */}
      <div className="mb-3">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
        
        {instructor && (
          <p className="text-sm text-gray-600 mb-2">Par {instructor}</p>
        )}

        {rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(rating) 
                      ? 'text-amber-500 fill-amber-500' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-1">
              {rating.toFixed(1)} 
              {formation.reviewCount && ` (${formation.reviewCount})`}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
        {description}
      </p>

      {/* Badges de catégorie et niveau */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="primary">
          {category}
        </Badge>
        <Badge variant={getLevelVariant()}>
          <Award className="w-3 h-3 mr-1" />
          {level}
        </Badge>
        {difficulty && (
          <Badge variant="default">
            {difficulty}
          </Badge>
        )}
      </div>

      {/* Métadonnées */}
      <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 mb-4 gap-2">
        <div className="flex items-center gap-4">
          {duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {duration}h
            </span>
          )}
          
          {totalLessons && (
            <span className="flex items-center gap-1">
              <PlayCircle className="w-4 h-4" />
              {totalLessons} leçons
            </span>
          )}

          {showEnrolled && maxParticipants && (
            <span className={`flex items-center gap-1 ${isFull ? 'text-red-600 font-medium' : ''}`}>
              <Users className="w-4 h-4" />
              {enrollmentCount}/{maxParticipants}
            </span>
          )}
        </div>

        {startDate && (
          <span className="flex items-center gap-1 text-xs">
            <Calendar className="w-3 h-3" />
            {formatDate(startDate)}
          </span>
        )}
      </div>

      {/* Bouton d'action */}
      {onAction && canEnroll && (
        <button
          onClick={() => onAction(formation)}
          disabled={!canEnroll}
          className={`
            w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 
            flex items-center justify-center gap-2
            ${showProgress && progressPercentage > 0 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-sm hover:shadow-md
          `}
        >
          {showProgress && progressPercentage > 0 ? (
            <>
              <PlayCircle className="w-4 h-4" />
              {progressPercentage === 100 ? 'Revoir' : 'Continuer'}
              {progressPercentage > 0 && (
                <span className="text-xs opacity-90">({progressPercentage}%)</span>
              )}
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4" />
              {actionLabel}
            </>
          )}
        </button>
      )}

      {/* Message si complet */}
      {isFull && showEnrolled && (
        <div className="text-center py-3">
          <span className="text-red-600 text-sm font-medium">
            Formation complète
          </span>
        </div>
      )}
    </div>
  );
}

// Composant pour une grille de cartes
export const FormationCardGrid = ({ children, columns = 3 }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {children}
    </div>
  );
};