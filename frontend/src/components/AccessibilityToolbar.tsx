/**
 * AccessibilityToolbar Component
 * Provides accessibility enhancement tools for users with disabilities
 * Follows WCAG 2.1 AA compliance standards and AAIP guidelines
 */

import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Moon, 
  Sun, 
  Maximize2, 
  Minimize2, 
  FileType, 
  Settings,
  Contrast,
  Palette,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  User,
  Users,
  Heart,
  Shield,
  Info,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  X,
  Menu,
  Search,
  Home,
  BookOpen,
  FileText,
  BarChart3,
  Database,
  DollarSign,
  HardHat,
  Building,
  Calendar,
  Clock,
  Tag,
  Filter,
  SortAsc,
  Download,
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
  Waves,
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
  Mango
} from 'lucide-react';

interface AccessibilityToolbarProps {
  onContrastChange?: (contrast: 'normal' | 'high' | 'black-on-white' | 'white-on-black') => void;
  onFontSizeChange?: (size: 'small' | 'medium' | 'large' | 'extra-large') => void;
  onColorSchemeChange?: (scheme: 'light' | 'dark' | 'auto') => void;
  onTextSpacingChange?: (spacing: boolean) => void;
  onReadingGuideChange?: (guide: boolean) => void;
  onKeyboardNavigationChange?: (enabled: boolean) => void;
  onScreenReaderChange?: (enabled: boolean) => void;
  onSpeechSynthesisChange?: (enabled: boolean) => void;
}

const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({
  onContrastChange,
  onFontSizeChange,
  onColorSchemeChange,
  onTextSpacingChange,
  onReadingGuideChange,
  onKeyboardNavigationChange,
  onScreenReaderChange,
  onSpeechSynthesisChange
}) => {
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [textSize, setTextSize] = useState<number>(100); // Percentage of normal size
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [textSpacing, setTextSpacing] = useState<boolean>(false);
  const [readingGuide, setReadingGuide] = useState<boolean>(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState<boolean>(true);
  const [screenReader, setScreenReader] = useState<boolean>(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<boolean>(false);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast');
    const savedDarkMode = localStorage.getItem('accessibility-dark-mode');
    const savedTextSize = localStorage.getItem('accessibility-text-size');
    const savedTextSpacing = localStorage.getItem('accessibility-text-spacing');
    const savedReadingGuide = localStorage.getItem('accessibility-reading-guide');
    const savedKeyboardNavigation = localStorage.getItem('accessibility-keyboard-navigation');
    const savedScreenReader = localStorage.getItem('accessibility-screen-reader');
    const savedSpeechSynthesis = localStorage.getItem('accessibility-speech-synthesis');
    
    if (savedHighContrast) setHighContrast(JSON.parse(savedHighContrast));
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
    if (savedTextSize) setTextSize(JSON.parse(savedTextSize));
    if (savedTextSpacing) setTextSpacing(JSON.parse(savedTextSpacing));
    if (savedReadingGuide) setReadingGuide(JSON.parse(savedReadingGuide));
    if (savedKeyboardNavigation) setKeyboardNavigation(JSON.parse(savedKeyboardNavigation));
    if (savedScreenReader) setScreenReader(JSON.parse(savedScreenReader));
    if (savedSpeechSynthesis) setSpeechSynthesis(JSON.parse(savedSpeechSynthesis));
  }, []);

  // Apply high contrast class to document
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('accessibility-high-contrast', JSON.stringify(highContrast));
    
    if (onContrastChange) {
      onContrastChange(highContrast ? 'high' : 'normal');
    }
  }, [highContrast, onContrastChange]);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
    localStorage.setItem('accessibility-dark-mode', JSON.stringify(darkMode));
    
    if (onColorSchemeChange) {
      onColorSchemeChange(darkMode ? 'dark' : 'light');
    }
  }, [darkMode, onColorSchemeChange]);

  // Apply text size to document
  useEffect(() => {
    document.documentElement.style.fontSize = `${textSize}%`;
    localStorage.setItem('accessibility-text-size', JSON.stringify(textSize));
    
    if (onFontSizeChange) {
      if (textSize < 90) {
        onFontSizeChange('small');
      } else if (textSize < 110) {
        onFontSizeChange('medium');
      } else if (textSize < 130) {
        onFontSizeChange('large');
      } else {
        onFontSizeChange('extra-large');
      }
    }
  }, [textSize, onFontSizeChange]);

  // Apply text spacing
  useEffect(() => {
    if (textSpacing) {
      document.documentElement.classList.add('text-spacing');
    } else {
      document.documentElement.classList.remove('text-spacing');
    }
    localStorage.setItem('accessibility-text-spacing', JSON.stringify(textSpacing));
    
    if (onTextSpacingChange) {
      onTextSpacingChange(textSpacing);
    }
  }, [textSpacing, onTextSpacingChange]);

  // Apply reading guide
  useEffect(() => {
    if (readingGuide) {
      document.documentElement.classList.add('reading-guide');
    } else {
      document.documentElement.classList.remove('reading-guide');
    }
    localStorage.setItem('accessibility-reading-guide', JSON.stringify(readingGuide));
    
    if (onReadingGuideChange) {
      onReadingGuideChange(readingGuide);
    }
  }, [readingGuide, onReadingGuideChange]);

  // Apply keyboard navigation
  useEffect(() => {
    if (keyboardNavigation) {
      document.documentElement.classList.remove('no-keyboard-navigation');
    } else {
      document.documentElement.classList.add('no-keyboard-navigation');
    }
    localStorage.setItem('accessibility-keyboard-navigation', JSON.stringify(keyboardNavigation));
    
    if (onKeyboardNavigationChange) {
      onKeyboardNavigationChange(keyboardNavigation);
    }
  }, [keyboardNavigation, onKeyboardNavigationChange]);

  // Apply screen reader
  useEffect(() => {
    if (screenReader) {
      document.documentElement.classList.add('screen-reader');
    } else {
      document.documentElement.classList.remove('screen-reader');
    }
    localStorage.setItem('accessibility-screen-reader', JSON.stringify(screenReader));
    
    if (onScreenReaderChange) {
      onScreenReaderChange(screenReader);
    }
  }, [screenReader, onScreenReaderChange]);

  // Apply speech synthesis
  useEffect(() => {
    if (speechSynthesis) {
      document.documentElement.classList.add('speech-synthesis');
    } else {
      document.documentElement.classList.remove('speech-synthesis');
    }
    localStorage.setItem('accessibility-speech-synthesis', JSON.stringify(speechSynthesis));
    
    if (onSpeechSynthesisChange) {
      onSpeechSynthesisChange(speechSynthesis);
    }
  }, [speechSynthesis, onSpeechSynthesisChange]);

  const increaseTextSize = () => {
    if (textSize < 150) {
      setTextSize(prev => prev + 10);
    }
  };

  const decreaseTextSize = () => {
    if (textSize > 80) {
      setTextSize(prev => prev - 10);
    }
  };

  const resetAccessibility = () => {
    setHighContrast(false);
    setDarkMode(false);
    setTextSize(100);
    setTextSpacing(false);
    setReadingGuide(false);
    setKeyboardNavigation(true);
    setScreenReader(false);
    setSpeechSynthesis(false);
  };

  const getContrastIcon = () => {
    if (highContrast) {
      return <Contrast className="h-4 w-4 mr-1" />;
    }
    return <Eye className="h-4 w-4 mr-1" />;
  };

  const getColorSchemeIcon = () => {
    if (darkMode) {
      return <Moon className="h-4 w-4 mr-1" />;
    }
    return <Sun className="h-4 w-4 mr-1" />;
  };

  const getTextSpacingIcon = () => {
    if (textSpacing) {
      return <Maximize2 className="h-4 w-4 mr-1" />;
    }
    return <Minimize2 className="h-4 w-4 mr-1" />;
  };

  const getReadingGuideIcon = () => {
    if (readingGuide) {
      return <BookOpen className="h-4 w-4 mr-1" />;
    }
    return <FileText className="h-4 w-4 mr-1" />;
  };

  const getKeyboardNavigationIcon = () => {
    if (keyboardNavigation) {
      return <Settings className="h-4 w-4 mr-1" />;
    }
    return <Settings className="h-4 w-4 mr-1" />;
  };

  const getScreenReaderIcon = () => {
    if (screenReader) {
      return <Volume2 className="h-4 w-4 mr-1" />;
    }
    return <VolumeX className="h-4 w-4 mr-1" />;
  };

  const getSpeechSynthesisIcon = () => {
    if (speechSynthesis) {
      return <Mic className="h-4 w-4 mr-1" />;
    }
    return <MicOff className="h-4 w-4 mr-1" />;
  };

  return (
    <div 
      className="mb-6"
      role="region"
      aria-label="Herramientas de accesibilidad"
    >
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 text-sm font-medium"
              aria-expanded={isExpanded}
              aria-controls="accessibility-controls"
              aria-label={isExpanded ? "Contraer herramientas de accesibilidad" : "Expandir herramientas de accesibilidad"}
            >
              <Settings className="h-4 w-4 mr-2" />
              Accesibilidad
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`p-1.5 rounded ${highContrast ? 'bg-blue-600 text-white' : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface-alt'}`}
              aria-pressed={highContrast}
              title={highContrast ? "Desactivar alto contraste" : "Activar alto contraste"}
              aria-label={highContrast ? "Desactivar alto contraste" : "Activar alto contraste"}
            >
              {getContrastIcon()}
            </button>
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-1.5 rounded ${darkMode ? 'bg-blue-600 text-white' : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface-alt'}`}
              aria-pressed={darkMode}
              title={darkMode ? "Desactivar modo oscuro" : "Activar modo oscuro"}
              aria-label={darkMode ? "Desactivar modo oscuro" : "Activar modo oscuro"}
            >
              {getColorSchemeIcon()}
            </button>
            
            <button
              onClick={decreaseTextSize}
              disabled={textSize <= 80}
              className={`p-1.5 rounded ${textSize <= 80 ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface-alt'}`}
              aria-label="Reducir tamaño de texto"
              aria-disabled={textSize <= 80}
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            
            <span className="text-sm text-gray-700 dark:text-gray-300 mx-1 min-w-[36px] text-center">
              {textSize}%
            </span>
            
            <button
              onClick={increaseTextSize}
              disabled={textSize >= 150}
              className={`p-1.5 rounded ${textSize >= 150 ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface-alt'}`}
              aria-label="Aumentar tamaño de texto"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div 
            id="accessibility-controls"
            className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="highContrastToggle"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-describedby="highContrastDescription"
                />
                <label 
                  htmlFor="highContrastToggle" 
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Modo de alto contraste
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="darkModeToggle"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-describedby="darkModeDescription"
                />
                <label 
                  htmlFor="darkModeToggle" 
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Modo oscuro
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="textSpacingToggle"
                  checked={textSpacing}
                  onChange={(e) => setTextSpacing(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-describedby="textSpacingDescription"
                />
                <label 
                  htmlFor="textSpacingToggle" 
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Espaciado de texto aumentado
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="readingGuideToggle"
                  checked={readingGuide}
                  onChange={(e) => setReadingGuide(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-describedby="readingGuideDescription"
                />
                <label 
                  htmlFor="readingGuideToggle" 
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Guía de lectura
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="keyboardNavigationToggle"
                  checked={keyboardNavigation}
                  onChange={(e) => setKeyboardNavigation(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-describedby="keyboardNavigationDescription"
                />
                <label 
                  htmlFor="keyboardNavigationToggle" 
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Navegación por teclado
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="screenReaderToggle"
                  checked={screenReader}
                  onChange={(e) => setScreenReader(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-describedby="screenReaderDescription"
                />
                <label 
                  htmlFor="screenReaderToggle" 
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Lector de pantalla
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="speechSynthesisToggle"
                  checked={speechSynthesis}
                  onChange={(e) => setSpeechSynthesis(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-describedby="speechSynthesisDescription"
                />
                <label 
                  htmlFor="speechSynthesisToggle" 
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Síntesis de voz
                </label>
              </div>
              
              <div className="flex items-center justify-end">
                <button
                  onClick={resetAccessibility}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  aria-label="Restablecer configuración de accesibilidad"
                >
                  Restablecer
                </button>
              </div>
            </div>
            
            <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center">
                <FileType className="h-4 w-4 mr-2" />
                Consejos de Accesibilidad
              </h4>
              <ul className="mt-2 text-xs text-blue-700 dark:text-blue-300 list-disc pl-5 space-y-1">
                <li>Use el teclado para navegar: Tab y Shift+Tab para moverse entre elementos</li>
                <li>Los elementos interactivos tienen indicadores de foco visibles</li>
                <li>El contenido se puede ampliar hasta 200% sin pérdida de funcionalidad</li>
                <li>El contraste de color cumple con las pautas WCAG 2.1 AA</li>
                <li>Todos los gráficos incluyen descripciones textuales alternativas</li>
                <li>Los formularios tienen etiquetas asociadas correctamente</li>
                <li>El sitio es compatible con lectores de pantalla</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* WCAG Compliance Notice */}
      <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
        <div className="flex items-center text-xs text-green-700 dark:text-green-300">
          <Shield className="h-3 w-3 mr-1 text-green-500" />
          <span>Este sitio cumple con los estándares WCAG 2.1 AA y las directrices de la AAIP</span>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityToolbar;