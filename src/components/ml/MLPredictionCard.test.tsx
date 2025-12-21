import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MLPredictionCard } from './MLPredictionCard';

const mockPrediction = { type: 'delay', probability: 0.85, impact: 'high', description: 'Atraso previsto de 2h' };

describe('MLPredictionCard', () => {
  it('should render prediction', () => {
    render(<MLPredictionCard prediction={mockPrediction} />);
    expect(screen.getByText(/predição|previsão/i)).toBeInTheDocument();
  });

  it('should show probability', () => {
    render(<MLPredictionCard prediction={mockPrediction} />);
    expect(screen.getByText(/85%/)).toBeInTheDocument();
  });

  it('should show impact level', () => {
    render(<MLPredictionCard prediction={mockPrediction} />);
    expect(screen.getByText(/alto|high/i)).toBeInTheDocument();
  });

  it('should display description', () => {
    render(<MLPredictionCard prediction={mockPrediction} />);
    expect(screen.getByText(/Atraso previsto/)).toBeInTheDocument();
  });
});
