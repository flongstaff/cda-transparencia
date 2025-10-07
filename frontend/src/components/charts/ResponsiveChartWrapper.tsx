import React, { useState, useEffect } from 'react';
import { ResponsiveContainer } from 'recharts';

interface ResponsiveChartWrapperProps {
  children: React.ReactNode;
  className?: string;
  height?: number | string;
  width?: number | string;
  aspect?: number;
}

const ResponsiveChartWrapper: React.FC<ResponsiveChartWrapperProps> = ({
  children,
  className = '',
  height = 400,
  width = '100%',
  aspect = 2
}) => {
  const [containerWidth, setContainerWidth] = useState<number | string>(width);
  const [chartHeight, setChartHeight] = useState<number>(typeof height === 'number' ? height : 400);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      // Adjust chart height based on screen size
      if (width < 640) { // Mobile
        setChartHeight(250);
        setContainerWidth('100%');
      } else if (width < 1024) { // Tablet
        setChartHeight(300);
        setContainerWidth('100%');
      } else { // Desktop
        setChartHeight(typeof height === 'number' ? height : 400);
        setContainerWidth('100%');
      }
    };

    // Initial resize
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup listener
    return () => window.removeEventListener('resize', handleResize);
  }, [height]);

  // Check if children is valid before rendering
  const validChildren = children && React.isValidElement(children) ? children : (
    <div className="flex items-center justify-center h-full w-full">
      <p className="text-gray-500">No hay datos disponibles</p>
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width={containerWidth} height={chartHeight} aspect={aspect}>
        {validChildren}
      </ResponsiveContainer>
    </div>
  );
};

export default ResponsiveChartWrapper;