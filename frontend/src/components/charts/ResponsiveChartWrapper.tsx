import React, { useState, useEffect } from 'react';
import { ResponsiveContainer } from 'recharts';
import { cloudflareWorkerDataService } from '../../services/CloudflareWorkerDataService';

interface ResponsiveChartWrapperProps {
  children: React.ReactNode;
  className?: string;
  height?: number | string;
  width?: number | string;
  aspect?: number;
  useAspect?: boolean; // New prop to control aspect vs height mode
}

const ResponsiveChartWrapper: React.FC<ResponsiveChartWrapperProps> = ({
  children,
  className = '',
  height = 400,
  width = '100%',
  aspect = 2,
  useAspect = false // Default to height mode for backwards compatibility
}) => {
  const [containerWidth, setContainerWidth] = useState<number | string>(width);
  const [chartHeight, setChartHeight] = useState<number>(typeof height === 'number' ? height : 400);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;

      // Adjust chart height based on screen size (only when not using aspect)
      if (!useAspect) {
        if (screenWidth < 640) { // Mobile
          setChartHeight(250);
        } else if (screenWidth < 1024) { // Tablet
          setChartHeight(300);
        } else { // Desktop
          setChartHeight(typeof height === 'number' ? height : 400);
        }
      }

      // Always set width to 100%
      setContainerWidth('100%');
    };

    // Initial resize
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup listener
    return () => window.removeEventListener('resize', handleResize);
  }, [height, useAspect]);

  // Check if children is valid before rendering
  const validChildren = children && React.isValidElement(children) ? children : (
    <div className="flex items-center justify-center h-full w-full">
      <p className="text-gray-500 dark:text-gray-400">No hay datos disponibles</p>
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      {useAspect ? (
        // Use aspect ratio mode (responsive to width)
        <ResponsiveContainer width={containerWidth} aspect={aspect}>
          {validChildren}
        </ResponsiveContainer>
      ) : (
        // Use fixed height mode (better for mobile)
        <ResponsiveContainer width={containerWidth} height={chartHeight}>
          {validChildren}
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ResponsiveChartWrapper;