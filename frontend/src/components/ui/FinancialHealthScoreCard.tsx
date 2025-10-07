import React from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface FinancialHealthScoreCardProps {
  score: number;
  title: string;
  description: string;
  trend?: 'up' | 'down' | 'stable';
  changeValue?: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const FinancialHealthScoreCard: React.FC<FinancialHealthScoreCardProps> = ({
  score,
  title,
  description,
  trend,
  changeValue,
  icon = <BarChart3 className="w-8 h-8" />,
  className = '',
  onClick
}) => {
  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  // Determine background color based on score
  const getBgColor = () => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  // Determine trend icon
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <span className="text-gray-500">→</span>;
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 ${getBgColor()} p-4 sm:p-6 ${className} transition-all duration-300 hover:shadow-xl cursor-pointer`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            {icon}
          </div>
          <div className="ml-3">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          </div>
        </div>
        {trend && changeValue && (
          <div className={`flex items-center sm:justify-end text-xs sm:text-sm font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
            <span className="mr-1">{getTrendIcon()}</span>
            <span>{changeValue}</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-baseline">
          <div className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {score}
          </div>
          <div className="text-xs sm:text-lg text-gray-500 dark:text-gray-400 ml-1">
            /100
          </div>
        </div>
        <div className={`text-lg sm:text-2xl font-bold ${getScoreColor()}`}>
          {score}%
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 sm:mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-2.5">
        <div 
          className={`h-2 sm:h-2.5 rounded-full ${getScoreColor().replace('text', 'bg')}`} 
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
};

export default FinancialHealthScoreCard;