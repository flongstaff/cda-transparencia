import React from 'react';
import { FileText, Calendar, BarChart3, CreditCard, Eye, Download, Filter, Search } from 'lucide-react';
import CategoryPage from '../../pages/CategoryPage';

interface FinancialDashboardProps {
  category: string;
  title: string;
  icon: string;
  description: string;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ 
  category, 
  title, 
  icon,
  description
}) => {
  return (
    <CategoryPage 
      category={category} 
      title={title} 
      icon={icon}
    />
  );
};

export default FinancialDashboard;