import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import StandardizedSection from '../ui/StandardizedSection';

interface RadarDataItem {
  subject: string;
  value: number;
  fullMark: number;
}

interface RadarChartProps {
  data: RadarDataItem[];
  title?: string;
  description?: string;
  height?: number;
  className?: string;
  color?: string;
}

const CustomRadarChart: React.FC<RadarChartProps> = ({
  data,
  title = 'Radar Chart',
  description,
  height = 400,
  className = '',
  color = '#3B82F6'
}) => {
  return (
    <StandardizedSection
      title={title}
      description={description}
      className={className}
    >
      <div style={{ height, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
            <Radar
              name="Performance"
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </StandardizedSection>
  );
};

export default CustomRadarChart;