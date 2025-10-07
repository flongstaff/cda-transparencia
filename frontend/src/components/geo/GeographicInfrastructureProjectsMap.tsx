/**
 * Geographic Infrastructure Projects Map Component
 * Displays infrastructure projects on an interactive map
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, CircularProgress, Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import chartDataService from '../../services/charts/ChartDataService';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Props for the Geographic Infrastructure Projects Map component
interface GeographicInfrastructureProjectsMapProps {
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

const GeographicInfrastructureProjectsMap: React.FC<GeographicInfrastructureProjectsMapProps> = ({
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
  
  return (
    <Paper className={`chart-container ${className}`} elevation={3}>
      {showTitle && (
        <Box p={2}>
          <Typography variant="h6" component="h3" className="chart-title">
            Geographic Infrastructure Projects Map
          </Typography>
          {showDescription && (
            <Typography variant="body2" className="chart-description" color="textSecondary">
              Interactive map showing infrastructure projects across Carmen de Areco
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
      
      {/* Map */}
      <Box height={height} width={width}>
        <MapContainer 
          center={[-34.3833, -59.8500]} // Carmen de Areco coordinates
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {filteredData.map(project => (
            <Marker 
              key={project.id} 
              position={[project.latitude, project.longitude]}
            >
              <Popup>
                <Box>
                  <Typography variant="h6" component="h4" gutterBottom>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {project.description}
                  </Typography>
                  
                  <Box mt={1}>
                    <Chip 
                      label={project.category} 
                      size="small" 
                      variant="outlined" 
                      sx={{ mr: 1 }} 
                    />
                    <Chip 
                      label={project.status} 
                      size="small" 
                      color={
                        project.status === 'completed' ? 'success' : 
                        project.status === 'delayed' ? 'error' : 
                        project.status === 'in-progress' ? 'primary' : 
                        'default'
                      } 
                    />
                  </Box>
                  
                  <Box mt={1}>
                    <Typography variant="body2">
                      <strong>Budget:</strong> ARS {project.budget.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Executed:</strong> ARS {project.executed.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Execution Rate:</strong> {project.budget > 0 ? ((project.executed / project.budget) * 100).toFixed(1) : '0.0'}%
                    </Typography>
                  </Box>
                  
                  {project.contractor && (
                    <Typography variant="body2" mt={1}>
                      <strong>Contractor:</strong> {project.contractor}
                    </Typography>
                  )}
                  
                  {project.startDate && (
                    <Typography variant="body2" mt={0.5}>
                      <strong>Start Date:</strong> {new Date(project.startDate).toLocaleDateString()}
                    </Typography>
                  )}
                  
                  {project.endDate && (
                    <Typography variant="body2" mt={0.5}>
                      <strong>End Date:</strong> {new Date(project.endDate).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
      
      {/* Summary */}
      <Box p={2} borderTop={1} borderColor="divider">
        <Typography variant="body2" color="textSecondary">
          Showing {filteredData.length} of {mapData.length} infrastructure projects
        </Typography>
      </Box>
    </Paper>
  );
};

export default GeographicInfrastructureProjectsMap;