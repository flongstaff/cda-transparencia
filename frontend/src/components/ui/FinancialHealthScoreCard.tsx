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
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 ${getBgColor()} p-6 ${className} transition-all duration-300 hover:shadow-xl cursor-pointer`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          {icon}
        </div>
        {trend && changeValue && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
            {getTrendIcon()}
            <span>{changeValue}</span>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {description}
        </p>
      </div>
      
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {score}
          <span className="text-lg text-gray-500 dark:text-gray-400">/100</span>
        </div>
        <div className={`text-2xl font-bold ${getScoreColor()}`}>
          {score}%
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${getScoreColor().replace('text', 'bg')}`} 
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
};

export default FinancialHealthScoreCard;