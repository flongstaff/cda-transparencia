/**
 * OpenDataCatalogPage Component
 * Main page for browsing open data catalog with AAIP-compliant categories and accessibility features
 */

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Filter, 
  Search, 
  Calendar, 
  FileText, 
  BarChart3, 
  Users, 
  Building, 
  DollarSign, 
  HardHat, 
  Shield, 
  Heart, 
  Megaphone, 
  Leaf, 
  Car, 
  Plane, 
  Ship, 
  Train, 
  Bike, 
  Truck, 
  Bus, 
  Rocket, 
  Zap, 
  Cloud, 
  Wind, 
  Sun as SunIcon, 
  Droplets, 
  Mountain, 
  TreePine, 
  Waves, 
  Castle, 
  Church, 
  School, 
  Hospital, 
  Store, 
  Factory, 
  Warehouse, 
  Tent, 
  House, 
  Hotel, 
  MapPin, 
  Navigation, 
  Compass, 
  Target, 
  Layers, 
  Grid, 
  List, 
  SortAsc, 
  SortDesc, 
  Eye, 
  EyeOff, 
  Upload, 
  Share2, 
  Printer, 
  Bookmark, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Bell, 
  Wifi, 
  Bluetooth, 
  Camera, 
  Video, 
  Music, 
  Film, 
  Gamepad2, 
  Coffee, 
  Utensils, 
  ShoppingCart, 
  Gift, 
  CreditCard, 
  CircleDollarSign, 
  PiggyBank, 
  Wallet, 
  Coins, 
  Gem, 
  Bitcoin, 
  Ethereum, 
  Litecoin, 
  Tether, 
  Monero, 
  Zcash, 
  Dash, 
  Waves as WavesIcon, 
  Stellar, 
  Ripple, 
  Cardano, 
  Solana, 
  Polygon, 
  Avalanche, 
  Cosmos, 
  Polkadot, 
  Chainlink, 
  Uniswap, 
  Sushi, 
  Pancake, 
  Aave, 
  Compound, 
  Maker, 
  Yearn, 
  Curve, 
  Balancer, 
  Synthetix, 
  ZeroX, 
  Kyber, 
  Bancor, 
  Oasis, 
  Loopring, 
  Dydx, 
  Perpetual, 
  Injective, 
  Serum, 
  Mango, 
  CheckCircle,
  AlertTriangle,
  X,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataCategoryCard from '../components/DataCategoryCard';
import AccessibilityToolbar from '../components/AccessibilityToolbar';
import { openDataService } from '../services/openDataService';

interface DataCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  itemsCount: number;
  lastUpdated: string;
  updateFrequency: string;
  dataTypes: string[];
  datasets: Dataset[];
}

interface Dataset {
  id: string;
  title: string;
  description: string;
  formats: string[];
  size: string;
  lastUpdated: string;
  accessibility: {
    compliant: boolean;
    standards: string[];
  };
  metadata: {
    publisher: string;
    issued: string;
    modified: string;
    theme: string;
    accessLevel: string;
    keyword: string[];
    landingPage: string;
    license: string;
    rights: string;
  };
}

const OpenDataCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<DataCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await openDataService.getCategories();
        setCategories(data.categories);
      } catch (err) {
        console.error('Error loading data categories:', err);
        setError('Error al cargar el catálogo de datos abiertos');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Filter categories based on search and selection
  const filteredCategories = categories.filter(category => {
    // Filter by search query
    const matchesSearch = 
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.dataTypes.some(type => type.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by category
    const matchesCategory = selectedCategory === 'all' || category.id === selectedCategory;
    
    // Filter by format if selected
    let matchesFormat = selectedFormat === 'all';
    if (selectedFormat !== 'all') {
      matchesFormat = category.datasets.some(dataset => 
        dataset.formats.includes(selectedFormat.toLowerCase())
      );
    }
    
    return matchesSearch && matchesCategory && matchesFormat;
  });

  // Sort the categories
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.title.localeCompare(b.title) 
        : b.title.localeCompare(a.title);
    } else if (sortBy === 'date') {
      return sortOrder === 'asc'
        ? new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
        : new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    } else if (sortBy === 'size') {
      // For size sorting, we'll sort by items count
      return sortOrder === 'asc'
        ? a.itemsCount - b.itemsCount
        : b.itemsCount - a.itemsCount;
    }
    return 0;
  });

  // Get all unique formats across all datasets
  const allFormats = Array.from(
    new Set(
      categories.flatMap(category => 
        category.datasets.flatMap(dataset => dataset.formats)
      )
    )
  );

  // Get all category IDs for filter options
  const categoryOptions = [
    { id: 'all', title: 'Todas las categorías' },
    ...categories.map(cat => ({ id: cat.id, title: cat.title }))
  ];

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'BarChart3': <BarChart3 className="w-6 h-6" />,
      'Building': <Building className="w-6 h-6" />,
      'FileText': <FileText className="w-6 h-6" />,
      'DollarSign': <DollarSign className="w-6 h-6" />,
      'HardHat': <HardHat className="w-6 h-6" />,
      'Shield': <Shield className="w-6 h-6" />,
      'Heart': <Heart className="w-6 h-6" />,
      'Megaphone': <Megaphone className="w-6 h-6" />,
      'Leaf': <Leaf className="w-6 h-6" />,
      'Car': <Car className="w-6 h-6" />,
      'Plane': <Plane className="w-6 h-6" />,
      'Ship': <Ship className="w-6 h-6" />,
      'Train': <Train className="w-6 h-6" />,
      'Bike': <Bike className="w-6 h-6" />,
      'Truck': <Truck className="w-6 h-6" />,
      'Bus': <Bus className="w-6 h-6" />,
      'Rocket': <Rocket className="w-6 h-6" />,
      'Zap': <Zap className="w-6 h-6" />,
      'Cloud': <Cloud className="w-6 h-6" />,
      'Wind': <Wind className="w-6 h-6" />,
      'Sun': <SunIcon className="w-6 h-6" />,
      'Droplets': <Droplets className="w-6 h-6" />,
      'Mountain': <Mountain className="w-6 h-6" />,
      'TreePine': <TreePine className="w-6 h-6" />,
      'Waves': <Waves className="w-6 h-6" />,
      'Castle': <Castle className="w-6 h-6" />,
      'Church': <Church className="w-6 h-6" />,
      'School': <School className="w-6 h-6" />,
      'Hospital': <Hospital className="w-6 h-6" />,
      'Store': <Store className="w-6 h-6" />,
      'Factory': <Factory className="w-6 h-6" />,
      'Warehouse': <Warehouse className="w-6 h-6" />,
      'Tent': <Tent className="w-6 h-6" />,
      'House': <House className="w-6 h-6" />,
      'Hotel': <Hotel className="w-6 h-6" />,
      'MapPin': <MapPin className="w-6 h-6" />,
      'Navigation': <Navigation className="w-6 h-6" />,
      'Compass': <Compass className="w-6 h-6" />,
      'Target': <Target className="w-6 h-6" />,
      'Layers': <Layers className="w-6 h-6" />,
      'Grid': <Grid className="w-6 h-6" />,
      'List': <List className="w-6 h-6" />,
      'SortAsc': <SortAsc className="w-6 h-6" />,
      'SortDesc': <SortDesc className="w-6 h-6" />,
      'Eye': <Eye className="w-6 h-6" />,
      'EyeOff': <EyeOff className="w-6 h-6" />,
      'Upload': <Upload className="w-6 h-6" />,
      'Share2': <Share2 className="w-6 h-6" />,
      'Printer': <Printer className="w-6 h-6" />,
      'Bookmark': <Bookmark className="w-6 h-6" />,
      'Star': <Star className="w-6 h-6" />,
      'ThumbsUp': <ThumbsUp className="w-6 h-6" />,
      'ThumbsDown': <ThumbsDown className="w-6 h-6" />,
      'MessageCircle': <MessageCircle className="w-6 h-6" />,
      'Bell': <Bell className="w-6 h-6" />,
      'Wifi': <Wifi className="w-6 h-6" />,
      'Bluetooth': <Bluetooth className="w-6 h-6" />,
      'Camera': <Camera className="w-6 h-6" />,
      'Video': <Video className="w-6 h-6" />,
      'Music': <Music className="w-6 h-6" />,
      'Film': <Film className="w-6 h-6" />,
      'Gamepad2': <Gamepad2 className="w-6 h-6" />,
      'Coffee': <Coffee className="w-6 h-6" />,
      'Utensils': <Utensils className="w-6 h-6" />,
      'ShoppingCart': <ShoppingCart className="w-6 h-6" />,
      'Gift': <Gift className="w-6 h-6" />,
      'CreditCard': <CreditCard className="w-6 h-6" />,
      'CircleDollarSign': <CircleDollarSign className="w-6 h-6" />,
      'PiggyBank': <PiggyBank className="w-6 h-6" />,
      'Wallet': <Wallet className="w-6 h-6" />,
      'Coins': <Coins className="w-6 h-6" />,
      'Gem': <Gem className="w-6 h-6" />,
      'Bitcoin': <Bitcoin className="w-6 h-6" />,
      'Ethereum': <Ethereum className="w-6 h-6" />,
      'Litecoin': <Litecoin className="w-6 h-6" />,
      'Tether': <Tether className="w-6 h-6" />,
      'Monero': <Monero className="w-6 h-6" />,
      'Zcash': <Zcash className="w-6 h-6" />,
      'Dash': <Dash className="w-6 h-6" />,
      'WavesIcon': <WavesIcon className="w-6 h-6" />,
      'Stellar': <Stellar className="w-6 h-6" />,
      'Ripple': <Ripple className="w-6 h-6" />,
      'Cardano': <Cardano className="w-6 h-6" />,
      'Solana': <Solana className="w-6 h-6" />,
      'Polygon': <Polygon className="w-6 h-6" />,
      'Avalanche': <Avalanche className="w-6 h-6" />,
      'Cosmos': <Cosmos className="w-6 h-6" />,
      'Polkadot': <Polkadot className="w-6 h-6" />,
      'Chainlink': <Chainlink className="w-6 h-6" />,
      'Uniswap': <Uniswap className="w-6 h-6" />,
      'Sushi': <Sushi className="w-6 h-6" />,
      'Pancake': <Pancake className="w-6 h-6" />,
      'Aave': <Aave className="w-6 h-6" />,
      'Compound': <Compound className="w-6 h-6" />,
      'Maker': <Maker className="w-6 h-6" />,
      'Yearn': <Yearn className="w-6 h-6" />,
      'Curve': <Curve className="w-6 h-6" />,
      'Balancer': <Balancer className="w-6 h-6" />,
      'Synthetix': <Synthetix className="w-6 h-6" />,
      'ZeroX': <ZeroX className="w-6 h-6" />,
      'Kyber': <Kyber className="w-6 h-6" />,
      'Bancor': <Bancor className="w-6 h-6" />,
      'Oasis': <Oasis className="w-6 h-6" />,
      'Loopring': <Loopring className="w-6 h-6" />,
      'Dydx': <Dydx className="w-6 h-6" />,
      'Perpetual': <Perpetual className="w-6 h-6" />,
      'Injective': <Injective className="w-6 h-6" />,
      'Serum': <Serum className="w-6 h-6" />,
      'Mango': <Mango className="w-6 h-6" />
    };
    
    return iconMap[iconName] || <Database className="w-6 h-6" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (size: string) => {
    return size;
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'csv': return <FileText className="h-4 w-4" />;
      case 'json': return <Database className="h-4 w-4" />;
      case 'xlsx': return <FileText className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'xml': return <FileText className="h-4 w-4" />;
      case 'txt': return <FileText className="h-4 w-4" />;
      case 'zip': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getFormatName = (format: string) => {
    switch (format.toLowerCase()) {
      case 'csv': return 'CSV';
      case 'json': return 'JSON';
      case 'xlsx': return 'Excel';
      case 'pdf': return 'PDF';
      case 'xml': return 'XML';
      case 'txt': return 'Texto';
      case 'zip': return 'ZIP';
      default: return format.toUpperCase();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center">
                <Database className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Catálogo de Datos Abiertos
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Conjuntos de datos reutilizables en formatos abiertos, alineados con las directrices de la AAIP
              </p>
            </div>
            
            {/* Compliance badges */}
            <div className="flex flex-col items-end">
              <div className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm px-3 py-1.5 rounded-full mb-2">
                <Shield className="w-4 h-4 mr-1" />
                Cumple AAIP
              </div>
              <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm px-3 py-1.5 rounded-full">
                <Shield className="w-4 h-4 mr-1" />
                WCAG 2.1 AA
              </div>
            </div>
          </div>
          
          {/* Accessibility Toolbar */}
          <AccessibilityToolbar />
          
          {/* Search and filters */}
          <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-200 dark:border-dark-border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar datos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                  aria-label="Buscar en el catálogo de datos"
                />
              </div>
              
              {/* Category filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                  aria-label="Filtrar por categoría"
                >
                  {categoryOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.title}</option>
                  ))}
                </select>
              </div>
              
              {/* Format filter */}
              <div>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                  aria-label="Filtrar por formato"
                >
                  <option value="all">Todos los formatos</option>
                  {allFormats.map(format => (
                    <option key={format} value={format}>{getFormatName(format)}</option>
                  ))}
                </select>
              </div>
              
              {/* Sort */}
              <div>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sortField, sortOrderValue] = e.target.value.split('-');
                    setSortBy(sortField as any);
                    setSortOrder(sortOrderValue as any);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                  aria-label="Ordenar resultados"
                >
                  <option value="name-asc">Nombre (A-Z)</option>
                  <option value="name-desc">Nombre (Z-A)</option>
                  <option value="date-desc">Más reciente primero</option>
                  <option value="date-asc">Más antiguo primero</option>
                  <option value="size-asc">Tamaño (menor primero)</option>
                  <option value="size-desc">Tamaño (mayor primero)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-700 dark:text-gray-300">Cargando catálogo de datos abiertos...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                Error
              </h3>
            </div>
            <p className="mt-2 text-red-700 dark:text-red-300">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Catalog content */}
        {!loading && !error && (
          <div>
            {sortedCategories.length === 0 ? (
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No se encontraron datos
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No hay datos que coincidan con los filtros aplicados.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {sortedCategories.length}{' '}
                    {sortedCategories.length === 1 ? 'categoría' : 'categorías'} encontradas
                  </h2>
                </div>
                
                {/* Categories grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedCategories.map((category) => (
                    <DataCategoryCard 
                      key={category.id} 
                      category={category} 
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* AAIP Compliance Information */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Cumplimiento y Accesibilidad
          </h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
            Este catálogo de datos abiertos se adhiere a las directrices de la Agencia de Acceso a la Información Pública (AAIP) 
            y cumple con los estándares de accesibilidad WCAG 2.1 AA.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
              <p className="ml-2 text-blue-700 dark:text-blue-300">
                Datos disponibles en múltiples formatos (CSV, JSON, Excel, PDF)
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
              <p className="ml-2 text-blue-700 dark:text-blue-300">
                Metadatos completos según estándares AAIP
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
              <p className="ml-2 text-blue-700 dark:text-blue-300">
                Actualización periódica según políticas municipales
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
              <p className="ml-2 text-blue-700 dark:text-blue-300">
                Accesible para personas con discapacidad
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenDataCatalogPage;