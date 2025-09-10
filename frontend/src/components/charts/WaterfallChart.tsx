import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface WaterfallDataPoint {
  name: string;
  value: number;
  type: 'start' | 'increase' | 'decrease' | 'end';
}

interface WaterfallChartProps {
  data: WaterfallDataPoint[];
  title?: string;
  height?: number;
  className?: string;
}

const WaterfallChart: React.FC<WaterfallChartProps> = ({ 
  data, 
  title, 
  height = 400,
  className = ''
}) => {
  // Calculate cumulative values for waterfall effect
  const processData = () => {
    let cumulative = 0;
    return data.map((item, index) => {
      const prevCumulative = cumulative;
      
      if (item.type === 'start') {
        cumulative = item.value;
      } else if (item.type === 'end') {
        // End value is already the final cumulative value
      } else {
        cumulative += item.value;
      }
      
      return {
        ...item,
        cumulative: cumulative,
        previous: prevCumulative
      };
    });
  };

  const processedData = processData();

  // Color coding for different types
  const getColor = (type: string) => {
    switch (type) {
      case 'start': return '#3B82F6';
      case 'increase': return '#10B981';
      case 'decrease': return '#EF4444';
      case 'end': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      {title && (
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      
      <div style={{ height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={processedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value, name, props) => {
                const item = props.payload;
                return [item.value.toLocaleString(), 'Change'];
              }}
              labelFormatter={(value) => `Stage: ${value}`}
            />
            <Bar dataKey="cumulative" fill="#8884d8">
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.type)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default WaterfallChart;