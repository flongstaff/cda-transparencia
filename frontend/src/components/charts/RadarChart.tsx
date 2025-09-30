import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface RadarDataPoint {
  subject: string;
  [key: string]: number | string;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  title?: string;
  height?: number;
  className?: string;
}

const RadarChartComponent: React.FC<RadarChartProps> = ({ 
  data, 
  title, 
  height = 400,
  className = ''
}) => {
  // Get all data keys except 'subject'
  const dataKeys = Object.keys(data[0] || {}).filter(key => key !== 'subject');
  
  // Define colors for each data series
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

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
      
      <div style={{ height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis />
            {dataKeys.map((key, index) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
              />
            ))}
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default RadarChartComponent;