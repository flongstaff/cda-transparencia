import React, { createContext, useContext, useState, useEffect } from 'react';

interface YearContextType {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  availableYears: number[];
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export const useYear = () => {
  const context = useContext(YearContext);
  if (context === undefined) {
    throw new Error('useYear must be used within a YearProvider');
  }
  return context;
};

interface YearProviderProps {
  children: React.ReactNode;
}

export const YearProvider: React.FC<YearProviderProps> = ({ children }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  // Available years from 2017 to current year + 1
  const availableYears = Array.from(
    { length: currentYear - 2017 + 2 }, 
    (_, i) => 2017 + i
  ).reverse(); // Most recent first

  // Save selected year to localStorage
  useEffect(() => {
    try {
      const savedYear = localStorage.getItem('transparencia-selected-year');
      if (savedYear && availableYears.includes(parseInt(savedYear))) {
        setSelectedYear(parseInt(savedYear));
      }
    } catch (error) {
      console.warn('Could not load selected year from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('transparencia-selected-year', selectedYear.toString());
    } catch (error) {
      console.warn('Could not save selected year to localStorage:', error);
    }
  }, [selectedYear]);

  const value = {
    selectedYear,
    setSelectedYear,
    availableYears
  };

  return (
    <YearContext.Provider value={value}>
      {children}
    </YearContext.Provider>
  );
};

export default YearProvider;