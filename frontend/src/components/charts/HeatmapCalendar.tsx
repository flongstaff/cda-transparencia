import React from 'react';
import { ResponsiveCalendar } from '@nivo/calendar';
import { motion } from 'framer-motion';

interface CalendarDataPoint {
  day: string;
  value: number;
}

interface HeatmapCalendarProps {
  data: CalendarDataPoint[];
  title?: string;
  height?: number;
  from: string;
  to: string;
  className?: string;
}

const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ 
  data, 
  title, 
  height = 400,
  from,
  to,
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
        <ResponsiveCalendar
          data={data}
          from={from}
          to={to}
          emptyColor="#eeeeee"
          colors={['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']}
          margin={{ top: 40, right: 40, bottom: 100, left: 40 }}
          yearSpacing={40}
          monthBorderColor="#ffffff"
          dayBorderWidth={2}
          dayBorderColor="#ffffff"
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'row',
              translateY: 36,
              itemCount: 4,
              itemWidth: 42,
              itemHeight: 36,
              itemsSpacing: 14,
              itemDirection: 'right-to-left'
            }
          ]}
          tooltip={({ day, value }) => (
            <div className="bg-white p-2 shadow-lg rounded border border-gray-200">
              <div className="font-semibold">{day}</div>
              <div className="text-sm text-gray-600">
                Value: {value.toLocaleString()}
              </div>
            </div>
          )}
        />
      </div>
    </motion.div>
  );
};

export default HeatmapCalendar;