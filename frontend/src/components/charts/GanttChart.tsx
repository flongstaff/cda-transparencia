import React from 'react';
import { motion } from 'framer-motion';

interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies?: string;
  custom_class?: string;
}

interface GanttChartProps {
  tasks: GanttTask[];
  title?: string;
  height?: number;
  className?: string;
}

const GanttChart: React.FC<GanttChartProps> = ({ 
  tasks, 
  title, 
  height = 400,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      {title && (
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">{title}</h3>
        </div>
      )}
      
      <div style={{ height: height }} className="p-4">
        <div className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
          Gantt chart functionality temporarily disabled for build compatibility.
          <div className="mt-4 space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="p-2 border rounded bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
                <div className="font-medium">{task.name}</div>
                <div className="text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                  {task.start} - {task.end} ({task.progress}% complete)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GanttChart;