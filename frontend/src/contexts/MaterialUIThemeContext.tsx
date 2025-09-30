import React, { createContext, useContext, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, PaletteMode } from '@mui/material/styles';
import { useTheme } from './ThemeContext';

interface MaterialUIThemeContextType {
  muiTheme: any;
}

const MaterialUIThemeContext = createContext<MaterialUIThemeContextType | undefined>(undefined);

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode colors
          primary: {
            main: '#1d4ed8', // blue-700
            light: '#3b82f6', // blue-500
            dark: '#1e40af', // blue-600
          },
          secondary: {
            main: '#9333ea', // purple-600
            light: '#a855f7', // purple-500
            dark: '#7e22ce', // purple-700
          },
          background: {
            default: '#f9fafb', // gray-50
            paper: '#ffffff',
          },
          text: {
            primary: '#111827', // gray-900
            secondary: '#6b7280', // gray-600
          },
          divider: '#e5e7eb', // gray-200
        }
      : {
          // Dark mode colors
          primary: {
            main: '#60a5fa', // blue-400
            light: '#93c5fd', // blue-300
            dark: '#3b82f6', // blue-500
          },
          secondary: {
            main: '#c4b5fd', // purple-300
            light: '#ddd6fe', // purple-200
            dark: '#a78bfa', // purple-400
          },
          background: {
            default: '#111827', // gray-900
            paper: '#1f2937', // gray-800
          },
          text: {
            primary: '#f9fafb', // gray-50
            secondary: '#9ca3af', // gray-400
          },
          divider: '#374151', // gray-700
        }),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
        }
      }
    }
  }
});

export const MaterialUIThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { darkMode } = useTheme();
  const mode: PaletteMode = darkMode ? 'dark' : 'light';
  
  const muiTheme = useMemo(
    () => createTheme(getDesignTokens(mode)),
    [mode]
  );

  return (
    <MuiThemeProvider theme={muiTheme}>
      {children}
    </MuiThemeProvider>
  );
};

export const useMaterialUITheme = () => {
  const context = useContext(MaterialUIThemeContext);
  if (context === undefined) {
    throw new Error('useMaterialUITheme must be used within a MaterialUIThemeProvider');
  }
  return context;
};