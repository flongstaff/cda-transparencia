import React from 'react';
import { ResponsiveTreeMap } from '@nivo/treemap';
import { formatCurrencyARS } from '../../utils/formatters';
import StandardizedSection from '../ui/StandardizedSection';

interface TreemapNode {
  id: string;
  label: string;
  value: number;
  color?: string;
}

interface TreemapChartProps {
  data: TreemapNode[];
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  colors?: string[];
  className?: string;
}

const TreemapChart: React.FC<TreemapChartProps> = ({
  data,
  title = 'Treemap Visualization',
  description,
  width = '100%',
  height = 400,
  colors = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
  className = ''
}) => {
  // Transform data to the format required by Nivo
  const transformedData = {
    name: 'root',
    children: data.map(item => ({
      id: item.id,
      name: item.label,
      loc: item.value,
      color: item.color
    }))
  };

  return (
    <StandardizedSection
      title={title}
      description={description}
      className={className}
    >
      <div style={{ width: width as string, height, position: 'relative' }}>
        <ResponsiveTreeMap
          data={transformedData}
          identity="name"
          value="loc"
          valueFormat=".02s"
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          labelSkipSize={12}
          labelTextColor={{
            from: 'color',
            modifiers: [
              {
                id: 'darker',
                type: 'darker',
                value: 3
              }
            ]
          }}
          parentLabelTextColor={{
            from: 'color',
            modifiers: [
              {
                id: 'darker',
                type: 'darker',
                value: 3
              }
            ]
          }}
          borderColor={{
            from: 'color',
            modifiers: [
              {
                id: 'darker',
                type: 'darker',
                value: 0.15
              }
            ]
          }}
          colors={colors}
          colorBy="id"
          animate={true}
          motionStiffness={120}
          motionDamping={15}
        />
      </div>
    </StandardizedSection>
  );
};

export default TreemapChart;