import React, { useState } from 'react';
import { PageYearSelector, AdvancedYearSelector } from '../forms';
import useYearSelection from '../../hooks/useYearSelection';
import { DEFAULT_YEAR } from '../../utils/yearConfig';

const YearSelectorDemo: React.FC = () => {
  // Basic state for simple demo
  const [basicYear, setBasicYear] = useState(DEFAULT_YEAR);
  const [advancedYear, setAdvancedYear] = useState(DEFAULT_YEAR);

  // Hook-based year selection with validation
  const {
    selectedYear: hookYear,
    setSelectedYear: setHookYear,
    availableYears,
    isYearValid,
    resetToDefault,
    resetToBestYear
  } = useYearSelection({
    initialYear: DEFAULT_YEAR,
    pageDataRequirements: ['budget', 'documents'],
    onYearChange: (year) => console.log('Hook year changed:', year)
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Year Selector Components Demo
        </h1>
        <p className="text-gray-600">
          Demonstrating React best practices with modern year selection components
        </p>
      </div>

      {/* Basic PageYearSelector */}
      <section className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          1. Basic PageYearSelector
        </h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <PageYearSelector
              selectedYear={basicYear}
              onYearChange={setBasicYear}
              label="Año Básico"
            />
            <PageYearSelector
              selectedYear={basicYear}
              onYearChange={setBasicYear}
              size="sm"
              variant="minimal"
              label="Minimal"
            />
            <PageYearSelector
              selectedYear={basicYear}
              onYearChange={setBasicYear}
              size="lg"
              variant="badge"
              label="Badge Style"
            />
          </div>
          <p className="text-sm text-gray-600">
            Selected: <span className="font-medium">{basicYear}</span>
          </p>
        </div>
      </section>

      {/* Advanced YearSelector - Dropdown */}
      <section className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          2. Advanced YearSelector - Dropdown Variant
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdvancedYearSelector
            selectedYear={advancedYear}
            onYearChange={setAdvancedYear}
            variant="dropdown"
            label="Dropdown con Datos"
            showDataAvailability={true}
            showDescription={true}
          />
          <AdvancedYearSelector
            selectedYear={advancedYear}
            onYearChange={setAdvancedYear}
            variant="dropdown"
            label="Dropdown con Búsqueda"
            allowCustomYear={true}
            size="lg"
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Selected: <span className="font-medium">{advancedYear}</span>
        </p>
      </section>

      {/* Advanced YearSelector - Tabs */}
      <section className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          3. Advanced YearSelector - Tabs Variant
        </h2>
        <AdvancedYearSelector
          selectedYear={advancedYear}
          onYearChange={setAdvancedYear}
          variant="tabs"
          label="Selección por Pestañas"
          showDataAvailability={true}
        />
      </section>

      {/* Advanced YearSelector - Cards */}
      <section className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          4. Advanced YearSelector - Cards Variant
        </h2>
        <AdvancedYearSelector
          selectedYear={advancedYear}
          onYearChange={setAdvancedYear}
          variant="cards"
          label="Selección por Tarjetas"
          showDataAvailability={true}
          showDescription={true}
        />
      </section>

      {/* Hook-based Year Selection */}
      <section className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          5. Hook-based Year Selection (useYearSelection)
        </h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <PageYearSelector
              selectedYear={hookYear}
              onYearChange={setHookYear}
              availableYears={availableYears}
              label="Con Hook"
            />
            <div className="flex gap-2">
              <button
                onClick={resetToDefault}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Reset Default
              </button>
              <button
                onClick={resetToBestYear}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
              >
                Best Year
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <strong>Selected:</strong> {hookYear}
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <strong>Valid:</strong> {isYearValid ? '✅' : '❌'}
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <strong>Available:</strong> {availableYears.length}
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <strong>Hook:</strong> Active
            </div>
          </div>
        </div>
      </section>

      {/* Performance & Accessibility Features */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          React Best Practices Implemented
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Performance</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ React.memo() for component memoization</li>
              <li>✅ useMemo() for expensive calculations</li>
              <li>✅ useCallback() for stable function references</li>
              <li>✅ Efficient re-render prevention</li>
              <li>✅ Lazy loading and code splitting ready</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Accessibility</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Proper ARIA labels and descriptions</li>
              <li>✅ Keyboard navigation support</li>
              <li>✅ Screen reader compatibility</li>
              <li>✅ Focus management</li>
              <li>✅ Semantic HTML structure</li>
            </ul>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-medium text-gray-700 mb-2">Developer Experience</h3>
          <ul className="text-sm text-gray-600 space-y-1 columns-2">
            <li>✅ TypeScript with strict typing</li>
            <li>✅ Consistent API patterns</li>
            <li>✅ Comprehensive prop validation</li>
            <li>✅ Custom hooks for state management</li>
            <li>✅ Flexible styling variants</li>
            <li>✅ Error boundaries ready</li>
            <li>✅ Testing-friendly architecture</li>
            <li>✅ Documentation and examples</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default YearSelectorDemo;