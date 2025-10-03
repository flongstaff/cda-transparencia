/**
 * Geographic Infrastructure Projects Visualization
 * Uses Deck.gl for 3D geographic visualization of infrastructure projects
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StaticMap } from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { Alert, CircularProgress, Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import chartDataService from '../../services/charts/ChartDataService';

// Mapbox access token (using public token for demonstration)
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2p0MG01MXRqMW45cjQzb2R6b3k2eWp5cyJ9.HTDZnQbx21x6P2dhL_IvrQ';

// Props for the Geographic Infrastructure Projects Visualization component
interface GeographicInfrastructureProjectsVisualizationProps {
  height?: number;
  width?: number | string;
  showTitle?: boolean;
  showDescription?: boolean;
  className?: string;
  year?: number;
}

// Define the data structure for infrastructure projects
interface InfrastructureProject {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  budget: number;
  executed: number;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  startDate?: string;
  endDate?: string;
  contractor?: string;
  category: string;
}

const GeographicInfrastructureProjectsVisualization: React.FC<GeographicInfrastructureProjectsVisualizationProps> = ({
  height = 500,
  width = '100%',
  showTitle = true,
  showDescription = true,
  className = '',
  year
}) => {
  const [mapData, setMapData] = useState<InfrastructureProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Load chart data using React Query
  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['chart-data', 'Infrastructure_Projects', year],
    queryFn: () => chartDataService.loadChartData('Infrastructure_Projects'),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
  
  // Process data when it changes
  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      setError(null);
    } else if (isError) {
      setLoading(false);
      setError(queryError?.message || 'Error loading infrastructure projects data');
    } else if (data) {
      // Process the raw data to match our expected format
      const processedData: InfrastructureProject[] = data.map((item: any, index: number) => ({
        id: item.id || item.Id || item.project_id || `project-${index}`,
        name: item.name || item.Name || item.project || item.title || `Project ${index + 1}`,
        description: item.description || item.Description || item.details || 'No description available',
        latitude: parseFloat(item.latitude || item.Latitude || item.lat || '-34.3833'), // Default to Carmen de Areco coordinates
        longitude: parseFloat(item.longitude || item.Longitude || item.lng || '-59.8500'), // Default to Carmen de Areco coordinates
        budget: parseFloat(item.budget || item.Budget || item.amount || item.total_budget || '0'),
        executed: parseFloat(item.executed || item.Executed || item.spent || item.executed_amount || '0'),
        status: (item.status || item.Status || item.state || 'planned') as 'planned' | 'in-progress' | 'completed' | 'delayed',
        startDate: item.startDate || item.StartDate || item.start_date || item.start || undefined,
        endDate: item.endDate || item.EndDate || item.end_date || item.end || undefined,
        contractor: item.contractor || item.Contractor || item.vendor || item.company || 'Not specified',
        category: item.category || item.Category || item.type || item.sector || 'General'
      }));
      
      setLoading(false);
      setError(null);
      setMapData(processedData);
    }
  }, [data, isLoading, isError, queryError]);
  
  // Get unique categories for filtering
  const categories = useMemo(() => {
    const cats = [...new Set(mapData.map(project => project.category))];
    return cats;
  }, [mapData]);
  
  // Get unique statuses for filtering
  const statuses = useMemo(() => {
    const stats = [...new Set(mapData.map(project => project.status))];
    return stats;
  }, [mapData]);
  
  // Filter data based on selections
  const filteredData = useMemo(() => {
    return mapData.filter(project => {
      const categoryMatch = selectedCategory === 'all' || project.category === selectedCategory;
      const statusMatch = selectedStatus === 'all' || project.status === selectedStatus;
      return categoryMatch && statusMatch;
    });
  }, [mapData, selectedCategory, selectedStatus]);
  
  // Create deck.gl layers
  const layers = useMemo(() => {
    return [
      new ScatterplotLayer({
        id: 'infrastructure-projects',
        data: filteredData,
        pickable: true,
        opacity: 0.8,
        stroked: true,
        filled: true,
        radiusScale: 6,
        radiusMinPixels: 1,
        radiusMaxPixels: 100,
        lineWidthMinPixels: 1,
        getPosition: (d: any) => [d.longitude, d.latitude],
        getRadius: (d: any) => Math.sqrt(d.budget) / 100, // Scale radius by budget
        getFillColor: (d: any) => {
          // Color based on status
          switch (d.status) {
            case 'completed': return [0, 255, 0]; // Green
            case 'in-progress': return [0, 0, 255]; // Blue
            case 'delayed': return [255, 0, 0]; // Red
            case 'planned': 
            default: 
              return [255, 255, 0]; // Yellow
          }
        },
        getLineColor: (d: any) => [0, 0, 0], // Black border
        onHover: (info: any) => {
          // Handle hover events if needed
        },
        onClick: (info: any) => {
          // Handle click events if needed
        }
      })
    ];
  }, [filteredData]);
  
  // Handle category filter change
  const handleCategoryChange = (event: any) => {
    setSelectedCategory(event.target.value);
  };
  
  // Handle status filter change
  const handleStatusChange = (event: any) => {
    setSelectedStatus(event.target.value);
  };
  
  // Show loading spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height} className={className}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading infrastructure projects data...
        </Typography>
      </Box>
    );
  }
  
  // Show error message
  if (error) {
    return (
      <Alert severity="error" className={className}>
        Error loading infrastructure projects data: {error}
      </Alert>
    );
  }
  
  // Show no data message
  if (!mapData || mapData.length === 0) {
    return (
      <Alert severity="warning" className={className}>
        No infrastructure projects data available
      </Alert>
    );
  }
  
  // Initial viewport settings (centered on Carmen de Areco)
  const initialViewState = {
    longitude: -59.8500,
    latitude: -34.3833,
    zoom: 11,
    pitch: 0,
    bearing: 0
  };
  
  return (
    <Paper className={`chart-container ${className}`} elevation={3}>
      {showTitle && (
        <Box p={2}>
          <Typography variant="h6" component="h3" className="chart-title">
            Geographic Infrastructure Projects Visualization
          </Typography>
          {showDescription && (
            <Typography variant="body2" className="chart-description" color="textSecondary">
              3D visualization of infrastructure projects across Carmen de Areco
            </Typography>
          )}
        </Box>
      )}
      
      {/* Filters */}
      <Box p={2} display="flex" flexWrap="wrap" gap={2}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            label="Category"
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map(category => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={selectedStatus}
            onChange={handleStatusChange}
            label="Status"
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="planned">Planned</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="delayed">Delayed</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Deck.gl Map */}
      <Box height={height} width={width}>
        <DeckGL
          initialViewState={initialViewState}
          controller={true}
          layers={layers}
          getTooltip={(info: any) => {
            if (info.object) {
              const project = info.object;
              return {
                html: `
                  <div style="background: white; padding: 10px; border-radius: 5px;">
                    <h3 style="margin: 0 0 5px 0;">${project.name}</h3>
                    <p style="margin: 0 0 5px 0;">${project.description}</p>
                    <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                      <span style="background: #e0e0e0; padding: 2px 5px; border-radius: 3px;">${project.category}</span>
                      <span style="background: ${
                        project.status === 'completed' ? '#4caf50' : 
                        project.status === 'delayed' ? '#f44336' : 
                        project.status === 'in-progress' ? '#2196f3' : 
                        '#ffeb3b'
                      }; color: ${
                        project.status === 'completed' || project.status === 'delayed' || project.status === 'in-progress' ? 'white' : 'black'
                      }; padding: 2px 5px; border-radius: 3px;">${project.status}</span>
                    </div>
                    <div>
                      <div><strong>Budget:</strong> ARS ${project.budget.toLocaleString()}</div>
                      <div><strong>Executed:</strong> ARS ${project.executed.toLocaleString()}</div>
                      <div><strong>Execution Rate:</strong> ${project.budget > 0 ? ((project.executed / project.budget) * 100).toFixed(1) : '0.0'}%</div>
                    </div>
                    ${project.contractor ? `<div><strong>Contractor:</strong> ${project.contractor}</div>` : ''}
                    ${project.startDate ? `<div><strong>Start Date:</strong> ${new Date(project.startDate).toLocaleDateString()}</div>` : ''}
                    ${project.endDate ? `<div><strong>End Date:</strong> ${new Date(project.endDate).toLocaleDateString()}</div>` : ''}
                  </div>
                `,
                style: {
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                  padding: 0
                }
              };
            }
            return null;
          }}
        >
          <StaticMap 
            mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
            mapStyle="mapbox://styles/mapbox/light-v10"
          />
        </DeckGL>
      </Box>
      
      {/* Legend */}
      <Box p={2} borderTop={1} borderColor="divider">
        <Typography variant="body2" gutterBottom><strong>Legend:</strong></Typography>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={12} height={12} bgcolor="#4caf50" borderRadius="50%"></Box>
            <Typography variant="body2">Completed</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={12} height={12} bgcolor="#2196f3" borderRadius="50%"></Box>
            <Typography variant="body2">In Progress</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={12} height={12} bgcolor="#f44336" borderRadius="50%"></Box>
            <Typography variant="body2">Delayed</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={12} height={12} bgcolor="#ffeb3b" borderRadius="50%"></Box>
            <Typography variant="body2">Planned</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={12} height={12} border="1px solid black" borderRadius="50%"></Box>
            <Typography variant="body2">Size represents budget amount</Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="textSecondary" mt={1}>
          Showing {filteredData.length} of {mapData.length} infrastructure projects
        </Typography>
      </Box>
    </Paper>
  );
};

export default GeographicInfrastructureProjectsVisualization;