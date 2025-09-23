# UI Component Testing Strategy

This document outlines the testing strategies for ensuring the quality, accessibility, and responsiveness of the new UI components.

## 1. Unit Testing

### Test Coverage Goals
- 100% component rendering
- 100% prop validation
- 100% event handling
- 100% accessibility attributes

### Testing Tools
- Jest for unit testing
- React Testing Library for component testing
- axe-core for accessibility testing

### Sample Test Structure
```tsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FinancialHealthScoreCard } from './ui/FinancialHealthScoreCard';

describe('FinancialHealthScoreCard', () => {
  test('renders with correct score', () => {
    render(<FinancialHealthScoreCard score={85} />);
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Excellent Financial Health')).toBeInTheDocument();
  });

  test('renders with custom title', () => {
    render(<FinancialHealthScoreCard score={75} title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<FinancialHealthScoreCard score={80} onClick={handleClick} />);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 2. Accessibility Testing

### Automated Testing
- Use axe-core with Jest for automated accessibility checks
- Test all component states (default, hover, focus, active)

### Manual Testing
- Screen reader testing with VoiceOver/NVDA/JAWS
- Keyboard navigation testing
- Color contrast verification

### Sample Accessibility Test
```tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FinancialHealthScoreCard } from './ui/FinancialHealthScoreCard';

expect.extend(toHaveNoViolations);

describe('FinancialHealthScoreCard Accessibility', () => {
  test('has no accessibility violations', async () => {
    const { container } = render(<FinancialHealthScoreCard score={85} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('has proper ARIA attributes', () => {
    const { getByRole } = render(<FinancialHealthScoreCard score={85} />);
    const button = getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('tabIndex', '0');
  });
});
```

## 3. Responsive Testing

### Viewport Testing
- Test on mobile (320px, 375px, 414px)
- Test on tablet (768px, 1024px)
- Test on desktop (1280px, 1440px, 1920px)

### Tools
- Jest with custom viewport testing
- Storybook with responsive preview
- BrowserStack for cross-device testing

### Sample Responsive Test
```tsx
import { render, screen } from '@testing-library/react';
import { FinancialHealthScoreCard } from './ui/FinancialHealthScoreCard';

describe('FinancialHealthScoreCard Responsive', () => {
  test('renders correctly on mobile', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<FinancialHealthScoreCard score={85} />);
    
    // Check that component renders without errors
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  test('renders correctly on desktop', () => {
    // Mock desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1440,
    });

    render(<FinancialHealthScoreCard score={85} />);
    
    // Check that component renders without errors
    expect(screen.getByText('85%')).toBeInTheDocument();
  });
});
```

## 4. Visual Regression Testing

### Tools
- Storybook with Chromatic for visual regression
- Percy for visual testing
- Custom screenshot testing with Playwright

### Setup
1. Create stories for each component
2. Configure Chromatic for continuous visual testing
3. Set up baseline screenshots for different viewports

### Sample Storybook Story
```tsx
import React from 'react';
import { FinancialHealthScoreCard } from './ui/FinancialHealthScoreCard';

export default {
  title: 'Components/FinancialHealthScoreCard',
  component: FinancialHealthScoreCard,
};

export const ExcellentScore = () => (
  <FinancialHealthScoreCard score={85} title="Financial Health Score" />
);

export const GoodScore = () => (
  <FinancialHealthScoreCard score={75} title="Financial Health Score" />
);

export const NeedsAttention = () => (
  <FinancialHealthScoreCard score={65} title="Financial Health Score" />
);
```

## 5. Performance Testing

### Metrics to Monitor
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Total Blocking Time (TBT)

### Tools
- Lighthouse CI for performance monitoring
- Web Vitals for real-user monitoring
- React Profiler for component performance

### Sample Performance Test
```tsx
import { render } from '@testing-library/react';
import { FinancialHealthScoreCard } from './ui/FinancialHealthScoreCard';

describe('FinancialHealthScoreCard Performance', () => {
  test('renders quickly', () => {
    const startTime = performance.now();
    render(<FinancialHealthScoreCard score={85} />);
    const endTime = performance.now();
    
    // Should render in less than 16ms (1 frame)
    expect(endTime - startTime).toBeLessThan(16);
  });
});
```

## 6. Cross-Browser Testing

### Supported Browsers
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Testing Strategy
- Automated testing with Playwright
- Manual testing for critical user flows
- Visual verification on all browsers

## 7. Integration Testing

### Test Scenarios
- Component interaction with state management
- Component integration with data fetching
- Component behavior in different application contexts

### Sample Integration Test
```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../pages/Home';

describe('Home Page Integration', () => {
  test('renders FinancialHealthScoreCard with data', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    // Wait for data to load
    const scoreCard = await screen.findByText(/Financial Health Score/i);
    expect(scoreCard).toBeInTheDocument();
  });
});
```

## 8. Continuous Integration

### GitHub Actions Workflow
```yaml
name: UI Component Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm test
      - name: Run accessibility tests
        run: npm run test:accessibility
      - name: Run visual tests
        run: npm run test:visual
```

## 9. Test Maintenance

### Best Practices
- Keep tests close to implementation
- Use descriptive test names
- Avoid testing implementation details
- Maintain test data fixtures
- Regular test review and cleanup

### Test Organization
```
src/
  components/
    ui/
      __tests__/
        FinancialHealthScoreCard.test.tsx
        EnhancedMetricCard.test.tsx
        DataVerificationBadge.test.tsx
        TransparencyScore.test.tsx
        FinancialCategoryNavigation.test.tsx
      stories/
        FinancialHealthScoreCard.stories.tsx
        EnhancedMetricCard.stories.tsx
        DataVerificationBadge.stories.tsx
        TransparencyScore.stories.tsx
        FinancialCategoryNavigation.stories.tsx
```