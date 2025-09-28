import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">Portal de Transparencia Carmen de Areco</h3>
            <p className="text-gray-400">Garantizando la transparencia en la gestión pública</p>
          </div>
          
          <div className="flex items-center">
            <div className="bg-green-600 rounded-full px-4 py-2 font-bold">
              <span className="text-white">Calidad:</span>
              <span className="ml-2 text-xl">100/100</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>Datos verificados y actualizados regularmente</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;