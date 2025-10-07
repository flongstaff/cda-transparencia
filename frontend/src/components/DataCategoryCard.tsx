/**
 * DataCategoryCard Component
 * Displays individual data category with AAIP-compliant metadata and accessibility features
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Database, 
  Download, 
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

interface DataCategoryCardProps {
  category: DataCategory;
  viewMode?: 'grid' | 'list';
}

const DataCategoryCard: React.FC<DataCategoryCardProps> = ({ 
  category, 
  viewMode = 'grid' 
}) => {
  const navigate = useNavigate();

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
      'Mango': <Mango className="w-6 h-6" />,
      'CheckCircle': <CheckCircle className="w-6 h-6" />,
      'AlertTriangle': <AlertTriangle className="w-6 h-6" />,
      'X': <X className="w-6 h-6" />,
      'Loader2': <Loader2 className="w-6 h-6" />,
      'Database': <Database className="w-6 h-6" />
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
    <div 
      className={viewMode === 'grid' 
        ? "bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer" 
        : "bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer flex items-start"
      }
      onClick={() => navigate(`/open-data/${category.id}`)}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-4">
          {getIconComponent(category.icon)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {category.title}
            </h3>
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-dark-surface-alt text-gray-700 dark:text-dark-text-secondary rounded-full">
              {category.itemsCount} conjuntos
            </span>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {category.description}
          </p>
          
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <FileText className="h-4 w-4 mr-1" />
              <span>{category.itemsCount} conjuntos</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                Act: {formatDate(category.lastUpdated)}
              </span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-1" />
              <span>Frec: {category.updateFrequency}</span>
            </div>
          </div>
          
          {/* Dataset previews */}
          {category.datasets && category.datasets.length > 0 && (
            <div className="border-t border-gray-100 dark:border-dark-border pt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Conjuntos de datos recientes:
              </h4>
              <ul className="space-y-2">
                {category.datasets.slice(0, 2).map((dataset) => (
                  <li 
                    key={dataset.id} 
                    className="text-sm text-gray-700 dark:text-gray-300 flex justify-between items-start"
                  >
                    <span className="truncate mr-2">{dataset.title}</span>
                    <div className="flex space-x-1">
                      {dataset.formats.slice(0, 2).map((format) => (
                        <span 
                          key={format} 
                          className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full flex items-center"
                          title={getFormatName(format)}
                        >
                          {getFormatIcon(format)}
                        </span>
                      ))}
                      {dataset.formats.length > 2 && (
                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                          +{dataset.formats.length - 2}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Accessibility status */}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-border">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {category.datasets.some(ds => ds.accessibility?.compliant) ? (
                  <div className="flex items-center text-green-600 dark:text-green-400 text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Accesible
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-xs">
                    No verificado
                  </div>
                )}
              </div>
              <button 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/open-data/${category.id}`);
                }}
                aria-label={`Ver datos de ${category.title}`}
              >
                Ver datos
                <Download className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataCategoryCard;