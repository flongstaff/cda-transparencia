import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import StandardizedSection from '../ui/StandardizedSection';
import { cloudflareWorkerDataService } from '../../services/CloudflareWorkerDataService';

interface WaterfallDataItem {
  name: string;
  value: number;
  type: 'start' | 'increase' | 'decrease' | 'end';
}

interface WaterfallChartProps {
  data: WaterfallDataItem[];
  title?: string;
  description?: string;
  height?: number;
  className?: string;
}

const WaterfallChart: React.FC<WaterfallChartProps> = ({
  data,
  title = 'Waterfall Chart',
  description,
  height = 400,
  className = ''
}) => {
  // Calculate cumulative values for the waterfall effect
  const calculateCumulative = () => {
    let cumulative = 0;
    return data.map((item, index) => {
      const isStart = item.type === 'start';
      const isEnd = item.type === 'end';
      
      if (isStart) {
        cumulative = item.value;
        return { ...item, cumulative, start: 0, end: item.value };
      } else if (isEnd) {
        const result = { ...item, cumulative, start: 0, end: cumulative + item.value };
        cumulative = result.end;
        return result;
      } else {
        const start = cumulative;
        const change = item.value;
        const end = start + change;
        cumulative = end;
        return { ...item, cumulative, start, end };
      }
    });
  };

  const waterfallData = calculateCumulative();

  // Function to get bar color based on type and value
  const getBarColor = (item: WaterfallDataItem) => {
    if (item.type === 'start' || item.type === 'end') return '#3B82F6'; // Blue for start/end
    return item.value >= 0 ? '#10B981' : '#EF4444'; // Green for increase, red for decrease
  };

  return (
    <StandardizedSection
      title={title}
      description={description}
      className={className}
    >
      <div style={{ height, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={waterfallData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(value)}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={50}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => [
                new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: 'ARS'
                }).format(Number(value)),
                'Value'
              ]}
              labelFormatter={(label) => `Category: ${label}`}
            />
            <Bar
              dataKey="value"
              fill="#8884d8"
              shape={(props) => {
                const { x, y, width, height, data } = props;
                const color = getBarColor(data);
                
                return (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={color}
                      rx={4}
                      ry={4}
                    />
                  </g>
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </StandardizedSection>
  );
};

export default WaterfallChart;