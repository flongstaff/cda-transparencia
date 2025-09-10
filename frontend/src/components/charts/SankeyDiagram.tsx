import React from 'react';
import { ResponsiveSankey } from '@nivo/sankey';
import { motion } from 'framer-motion';

interface SankeyNode {
  id: string;
  name?: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

interface SankeyDiagramProps {
  data: SankeyData;
  title?: string;
  height?: number;
  className?: string;
}

const SankeyDiagram: React.FC<SankeyDiagramProps> = ({ 
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
        <ResponsiveSankey
          data={data}
          margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
          align="justify"
          colors={{ scheme: 'category10' }}
          nodeOpacity={1}
          nodeThickness={18}
          nodeInnerPadding={3}
          nodeSpacing={24}
          nodeBorderWidth={0}
          linkOpacity={0.5}
          linkHoverOthersOpacity={0.1}
          enableLinkGradient={true}
          labelPosition="outside"
          labelOrientation="vertical"
          labelPadding={16}
          labelTextColor={{
            from: 'color',
            modifiers: [['darker', 1]]
          }}
          tooltip={(node) => (
            <div className="bg-white p-2 shadow-lg rounded border border-gray-200">
              <div className="font-semibold">{node.label}</div>
              {node.value && (
                <div className="text-sm text-gray-600">
                  Value: {node.value.toLocaleString()}
                </div>
              )}
            </div>
          )}
        />
      </div>
    </motion.div>
  );
};

export default SankeyDiagram;