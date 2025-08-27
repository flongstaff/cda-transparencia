import React, { useState, useEffect } from 'react';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import LegalDisclaimer from './LegalDisclaimer';

const ProjectDisclaimerBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Check if user has already dismissed the banner
  useEffect(() => {
    const isDismissed = localStorage.getItem('transparency-banner-dismissed');
    if (isDismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('transparency-banner-dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-blue-600 text-white p-3 shadow-lg border-t border-blue-700">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <InformationCircleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              <strong>Proyecto independiente:</strong> Este portal no está vinculado oficialmente con el Concejo Municipal de Carmen de Areco. 
              <span className="hidden sm:inline"> Usa siempre los canales oficiales para trámites administrativos.</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LegalDisclaimer />
            <button
              onClick={handleDismiss}
              className="text-white hover:text-blue-200 transition-colors"
              aria-label="Cerrar aviso"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDisclaimerBanner;