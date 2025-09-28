import React from 'react';

const ChartSkeleton = (props: React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div {...props} className="animate-pulse bg-gray-200 rounded-lg w-full h-64"></div>
  );
};

export default ChartSkeleton;
