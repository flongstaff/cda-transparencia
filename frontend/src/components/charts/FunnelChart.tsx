import React from 'react';
import { ResponsiveFunnel } from '@nivo/funnel';
import { motion } from 'framer-motion';

interface FunnelDataPoint {
  id: string;
  value: number;
  label: string;
}

interface FunnelChartProps {
  data: FunnelDataPoint[];
  title?: string;
  height?: number;
  className?: string;
}

const FunnelChart: React.FC<FunnelChartProps> = ({ 
  data, 
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
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      
      <div style={{ height: height }}>
        <ResponsiveFunnel
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          valueFormat=">-.0s"
          colors={{ scheme: 'blues' }}
          borderWidth={20}
          labelColor={{
            from: 'color',
            modifiers: [['darker', 3]]
          }}
          beforeSeparatorLength={100}
          beforeSeparatorOffset={20}
          afterSeparatorLength={100}
          afterSeparatorOffset={20}
          currentPartSizeExtension={10}
          currentBorderWidth={40}
          motionConfig="wobbly"
          tooltip={({ data }) => (
            <div className="bg-white p-2 shadow-lg rounded border border-gray-200">
              <div className="font-semibold">{data.label}</div>
              <div className="text-sm text-gray-600">
                Value: {data.value.toLocaleString()}
              </div>
            </div>
          )}
        />
      </div>
    </motion.div>
  );
};

export default FunnelChart;