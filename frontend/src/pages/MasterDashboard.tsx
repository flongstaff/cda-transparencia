import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * MasterDashboard - Redirects to DashboardCompleto
 * This page existed to provide similar functionality to the old MasterDashboard
 * but now consolidates all features in DashboardCompleto
 */
const MasterDashboard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the comprehensive dashboard that now includes all functionality
    navigate('/completo');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirigiendo...</h2>
        <p className="text-gray-600">Dirigiendo al Dashboard Completo...</p>
      </div>
    </div>
  );
};

export default MasterDashboard;