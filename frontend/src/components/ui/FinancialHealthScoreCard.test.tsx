import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FinancialHealthScoreCard from './FinancialHealthScoreCard';

describe('FinancialHealthScoreCard', () => {
  const mockProps = {
    score: 85,
    title: 'Financial Health',
    description: 'Overall financial health score',
    trend: 'up' as const,
    changeValue: '+5%',
  };

  it('renders correctly with required props', () => {
    render(<FinancialHealthScoreCard {...mockProps} />);
    
    expect(screen.getByText('Financial Health')).toBeInTheDocument();
    expect(screen.getByText('Overall financial health score')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('displays the correct score color', () => {
    render(<FinancialHealthScoreCard {...mockProps} />);
    
    const scoreElement = screen.getByText('85%');
    expect(scoreElement).toHaveClass('text-green-500');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<FinancialHealthScoreCard {...mockProps} onClick={handleClick} />);
    
    const card = screen.getByRole('button');
    card.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});