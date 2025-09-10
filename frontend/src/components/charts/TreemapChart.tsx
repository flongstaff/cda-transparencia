import React from 'react';
import { ResponsiveTreeMap } from '@nivo/treemap';
import { motion } from 'framer-motion';

interface TreemapDataNode {
  name: string;
  value?: number;
  children?: TreemapDataNode[];
}

interface TreemapChartProps {
  data: TreemapDataNode[];
  title?: string;
  height?: number;
  className?: string;
}

const TreemapChart: React.FC<TreemapChartProps> = ({ 
  data, 
  title, 
  height = 400,
  className = ''
}) => {
  // Format data for nivo treemap
  const formattedData = {
    name: 'root',
    children: data
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
        <ResponsiveTreeMap
          data={formattedData}
          identity="name"
          value="value"
          valueFormat=".0s"
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          colors={{ scheme: 'blues' }}
          borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
          labelSkipSize={12}
          labelTextColor={{
            from: 'color',
            modifiers: [['darker', 1.2]]
          }}
          parentLabelTextColor={{
            from: 'color',
            modifiers: [['darker', 2]]
          }}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
          tooltip={({ node }) => (
            <div className="bg-white p-2 shadow-lg rounded border border-gray-200">
              <div className="font-semibold">{node.data.name}</div>
              <div className="text-sm text-gray-600">
                Value: {node.value?.toLocaleString() || 'N/A'}
              </div>
            </div>
          )}
        />
      </div>
    </motion.div>
  );
};

export default TreemapChart;