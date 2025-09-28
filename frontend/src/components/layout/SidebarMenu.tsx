import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NAV_CATEGORIES } from '../../config/navigationConfig';

interface SidebarMenuProps {
  isExpanded: boolean;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isExpanded }) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['main', 'financial', 'documents']);
  const location = useLocation();

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const renderCategory = (category: any) => {
    const isCategoryExpanded = expandedCategories.includes(category.id);
    const hasChildren = category.items && category.items.length > 0;

    return (
      <div key={category.id} className="mb-1">
        {isExpanded ? (
          // Expanded view with full text
          <button
            onClick={() => hasChildren && toggleCategory(category.id)}
            className="w-full flex items-center px-4 py-3 text-left hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg group"
            disabled={!hasChildren}
          >
            <category.icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-gray-700 group-hover:text-blue-700 text-sm">
                {category.title}
              </div>
            </div>
            {hasChildren && (
              <div className="ml-auto">
                {isCategoryExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                )}
              </div>
            )}
          </button>
        ) : (
          // Collapsed view with icon only
          <button
            onClick={() => hasChildren && toggleCategory(category.id)}
            className="w-full flex items-center justify-center p-3 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg"
            title={category.title}
            disabled={!hasChildren}
          >
            <category.icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600 flex-shrink-0" />
          </button>
        )}

        {hasChildren && isCategoryExpanded && isExpanded && (
          <div className="ml-2 mt-1 space-y-1">
            {category.items.map((item: any) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 my-0.5 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                      : 'hover:bg-gray-50 hover:text-gray-900'
                  } ml-6 py-2`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`h-4 w-4 mr-3 flex-shrink-0 ${
                      isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                    }`} />
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'
                    }`}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className={`ml-auto px-2 py-0.5 text-xs rounded-full ${
                        isActive
                          ? 'bg-blue-200 text-blue-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="mt-4 pb-4 overflow-y-auto h-full">
      <div className="space-y-1">
        {NAV_CATEGORIES.map(category => renderCategory(category))}
      </div>
    </nav>
  );
};

export default SidebarMenu;