import React from 'react';

function App() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', fontSize: '32px', marginBottom: '20px' }}>
        Portal de Transparencia - Carmen de Areco
      </h1>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ color: '#2563eb', fontSize: '24px' }}>Sistema Funcionando</h2>
        <p style={{ fontSize: '18px', lineHeight: '1.5' }}>
          Si puedes ver este mensaje, React está funcionando correctamente.
        </p>
        <ul style={{ fontSize: '16px', lineHeight: '1.6' }}>
          <li>✅ Servidor de desarrollo activo</li>
          <li>✅ React renderizando</li>
          <li>✅ CSS aplicándose</li>
          <li>✅ JavaScript ejecutándose</li>
        </ul>
      </div>
      <div style={{ backgroundColor: '#dbeafe', padding: '15px', borderRadius: '8px', border: '1px solid #3b82f6' }}>
        <p style={{ margin: '0', color: '#1e40af' }}>
          <strong>Próximo paso:</strong> Restaurar gradualmente los componentes del portal.
        </p>
      </div>
    </div>
  );
}

export default App;