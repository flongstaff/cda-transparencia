// Icon Tree-shaking Optimization
// Centralized icon imports to enable efficient tree-shaking and reduce bundle size

// Chart and visualization icons - only import what we need
export {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Filter,
  Share2,
  Layers,
  ArrowRight,
  Building,
  Users,
  Wrench,
  DollarSign
} from 'lucide-react';

// UI and interaction icons
export {
  Loader2,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  Eye,
  EyeOff,
  Settings,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// File and document icons
export {
  FileText,
  Download,
  Upload,
  ExternalLink,
  Copy,
  Share,
  Save,
  Trash2,
  Edit3,
  Plus,
  Minus
} from 'lucide-react';

// Status and notification icons
export {
  Info,
  Check,
  AlertCircle,
  HelpCircle,
  Bell,
  BellOff,
  Star,
  Heart,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';

// System and admin icons
export {
  Database,
  Server,
  Shield,
  Lock,
  Unlock,
  Key,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Power
} from 'lucide-react';

// Navigation and layout icons
export {
  Home,
  Calendar,
  Map,
  Globe,
  Bookmark,
  Tag,
  Archive,
  Folder,
  FolderOpen,
  Grid3X3,
  List,
  Table
} from 'lucide-react';

// Icon utility type for better TypeScript support
export type IconType = React.ComponentType<{
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

// Icon size constants for consistent usage
export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48
} as const;

// Icon color utilities based on design system
export const getIconColorClass = (variant: 'primary' | 'success' | 'warning' | 'error' | 'neutral' = 'neutral') => {
  const colorMap = {
    primary: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  };
  
  return colorMap[variant];
};

// Utility function to create icon with consistent props
export const createIcon = (
  IconComponent: IconType,
  {
    size = 'md',
    variant = 'neutral',
    className = '',
    ...props
  }: {
    size?: keyof typeof ICON_SIZES;
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
    className?: string;
    [key: string]: any;
  }
) => {
  const sizeValue = ICON_SIZES[size];
  const colorClass = getIconColorClass(variant);
  const combinedClassName = `${colorClass} ${className}`.trim();

  return React.createElement(IconComponent, {
    size: sizeValue,
    className: combinedClassName,
    ...props
  });
};

// Chart-specific icon mapping for better organization
export const CHART_ICONS = {
  treemap: BarChart3,
  waterfall: TrendingUp,
  funnel: Filter,
  sankey: Share2,
  debt: PieChart,
  budget: BarChart3,
  loading: Loader2,
  error: AlertTriangle,
  refresh: RefreshCw,
  success: CheckCircle
} as const;

export type ChartIconType = keyof typeof CHART_ICONS;

// Get chart icon by type
export const getChartIcon = (chartType: ChartIconType): IconType => {
  return CHART_ICONS[chartType];
};

// Performance monitoring for icon usage (development only)
if (process.env.NODE_ENV === 'development') {
  const iconUsageTracker = new Map<string, number>();
  
  const originalCreateIcon = createIcon;
  // @ts-expect-error - Override for development tracking
  createIcon = (IconComponent: IconType, props: any) => {
    const iconName = IconComponent.displayName || IconComponent.name || 'UnknownIcon';
    iconUsageTracker.set(iconName, (iconUsageTracker.get(iconName) || 0) + 1);
    
    // Log usage stats periodically
    if (iconUsageTracker.size % 50 === 0) {
      console.log('📊 Icon Usage Stats:', Object.fromEntries(iconUsageTracker));
    }
    
    return originalCreateIcon(IconComponent, props);
  };
}

// Export React for convenience
export { default as React } from 'react';