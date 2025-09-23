import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface TransparencyScoreProps {
  score: number;
  totalPossible: number;
  description: string;
  lastAudit: Date;
  className?: string;
}

const TransparencyScore: React.FC<TransparencyScoreProps> = ({
  score,
  totalPossible,
  description,
  lastAudit,
  className = ''
}) => {
  // Format date to human readable format
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Calculate star rating (0-5 stars)
  const calculateStarRating = () => {
    const percentage = (score / totalPossible) * 100;
    const stars = (percentage / 100) * 5;
    return stars;
  };

  // Render stars
  const renderStars = () => {
    const stars = calculateStarRating();
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <StarHalf className="w-5 h-5 fill-yellow-400 text-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300 dark:text-gray-600" />
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transparencia</h3>
        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
          {score}/{totalPossible}
        </div>
      </div>
      
      <div className="mb-3">
        {renderStars()}
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {description}
      </p>
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Última auditoría: {formatDate(lastAudit)}
      </div>
      
      <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full" 
          style={{ width: `${(score / totalPossible) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default TransparencyScore;