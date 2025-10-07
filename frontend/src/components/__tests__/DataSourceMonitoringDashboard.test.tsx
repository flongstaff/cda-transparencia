import React from 'react';
import { createRoot } from 'react-dom/client';
import DataSourceMonitoringDashboard from './DataSourceMonitoringDashboard';

// Create a simple test container
const container = document.createElement('div');
container.id = 'test-container';
document.body.appendChild(container);

// Render the component
const root = createRoot(container);
root.render(<DataSourceMonitoringDashboard />);

console.log('DataSourceMonitoringDashboard component rendered successfully');