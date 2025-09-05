import React, { useEffect, useRef } from 'react';
import { ExternalLink, Maximize2, Minimize2, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PowerBIEmbedProps {
  title: string;
  reportUrl?: string;
  height?: number;
  showFullscreen?: boolean;
  showDataDashboardLink?: boolean;
  className?: string;
}

const PowerBIEmbed: React.FC<PowerBIEmbedProps> = ({
  title,
  reportUrl = 'https://app.powerbi.com/view?r=eyJrIjoiYzhjNWNhNmItOWY5Zi00OWExLTliMzAtMjYxZTM0NjM1Y2Y2IiwidCI6Ijk3MDQwMmVmLWNhZGMtNDcyOC05MjI2LTk3ZGRlODY4ZDg2ZCIsImMiOjR9&pageName=ReportSection',
  height = 600,
  showFullscreen = true,
  showDataDashboardLink = true,
  className = ''
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  const navigate = useNavigate();

  const openInNewTab = () => {
    window.open(reportUrl, '_blank', 'noopener,noreferrer');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const goToDataDashboard = () => {
    navigate('/powerbi-data');
  };

  useEffect(() => {
    // Ensure iframe is responsive
    const handleResize = () => {
      if (iframeRef.current) {
        iframeRef.current.style.width = '100%';
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Datos oficiales en tiempo real - Carmen de Areco
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {showDataDashboardLink && (
            <button
              onClick={goToDataDashboard}
              className="flex items-center px-3 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors text-sm"
            >
              <Database className="h-4 w-4 mr-2" />
              Datos Extraídos
            </button>
          )}
          
          <button
            onClick={openInNewTab}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Abrir en nueva ventana"
          >
            <ExternalLink size={18} />
          </button>
          
          {showFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title={isFullscreen ? "Minimizar" : "Pantalla completa"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          )}
        </div>
      </div>

      <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
        {isFullscreen && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Minimize2 size={20} />
            </button>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          src={reportUrl}
          width="100%"
          height={isFullscreen ? '100vh' : height}
          frameBorder="0"
          allowFullScreen={true}
          className="border-0"
          title={title}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          style={{
            border: 'none',
            minHeight: isFullscreen ? '100vh' : `${height}px`
          }}
        />
        
        {!isFullscreen && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs px-3 py-1 rounded-lg">
            Carmen de Areco - PowerBI
          </div>
        )}
      </div>
    </div>
  );
};

export default PowerBIEmbed;
