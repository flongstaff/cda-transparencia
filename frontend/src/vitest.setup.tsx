import { vi } from 'vitest';

vi.mock('lucide-react', () => {
  return {
    __esModule: true,
    default: (props) => <svg {...props} />,
    ChevronDown: (props) => <svg {...props} data-testid="chevron-down-icon" />,
    FileText: (props) => <svg {...props} data-testid="file-text-icon" />,
    Filter: (props) => <svg {...props} data-testid="filter-icon" />,
    Search: (props) => <svg {...props} data-testid="search-icon" />,
    Plus: (props) => <svg {...props} data-testid="plus-icon" />,
    MoreHorizontal: (props) => <svg {...props} data-testid="more-horizontal-icon" />,
    Trash2: (props) => <svg {...props} data-testid="trash-2-icon" />,
    Edit: (props) => <svg {...props} data-testid="edit-icon" />,
    Eye: (props) => <svg {...props} data-testid="eye-icon" />,
    ChevronLeft: (props) => <svg {...props} data-testid="chevron-left-icon" />,
    ChevronRight: (props) => <svg {...props} data-testid="chevron-right-icon" />,
    ChevronsLeft: (props) => <svg {...props} data-testid="chevrons-left-icon" />,
    ChevronsRight: (props) => <svg {...props} data-testid="chevrons-right-icon" />,
    ArrowUpDown: (props) => <svg {...props} data-testid="arrow-up-down-icon" />,
    Check: (props) => <svg {...props} data-testid="check-icon" />,
    X: (props) => <svg {...props} data-testid="x-icon" />,
    Sun: (props) => <svg {...props} data-testid="sun-icon" />,
    Moon: (props) => <svg {...props} data-testid="moon-icon" />,
    Laptop: (props) => <svg {...props} data-testid="laptop-icon" />,
    Calendar: (props) => <svg {...props} data-testid="calendar-icon" />,
    Copy: (props) => <svg {...props} data-testid="copy-icon" />,
    CheckCircle: (props) => <svg {...props} data-testid="check-circle-icon" />,
    Info: (props) => <svg {...props} data-testid="info-icon" />,
    AlertTriangle: (props) => <svg {...props} data-testid="alert-triangle-icon" />,
    AlertCircle: (props) => <svg {...props} data-testid="alert-circle-icon" />,
    BarChart3: (props) => <svg {...props} data-testid="bar-chart-3-icon" />,
    Activity: (props) => <svg {...props} data-testid="activity-icon" />,
    PieChart: (props) => <svg {...props} data-testid="pie-chart-icon" />,
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
