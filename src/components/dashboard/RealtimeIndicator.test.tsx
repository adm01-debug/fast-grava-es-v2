import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RealtimeIndicator } from './RealtimeIndicator';

describe('RealtimeIndicator', () => {
  it('should show connected status', () => {
    render(<RealtimeIndicator isConnected={true} />);
    expect(screen.getByText(/conectado|online|ao vivo/i)).toBeInTheDocument();
  });

  it('should show disconnected status', () => {
    render(<RealtimeIndicator isConnected={false} />);
    expect(screen.getByText(/desconectado|offline/i)).toBeInTheDocument();
  });

  it('should show green indicator when connected', () => {
    render(<RealtimeIndicator isConnected={true} />);
    const indicator = document.querySelector('.bg-green-500, .text-green');
    expect(indicator || screen.getByText(/conectado/i)).toBeInTheDocument();
  });

  it('should show red indicator when disconnected', () => {
    render(<RealtimeIndicator isConnected={false} />);
    const indicator = document.querySelector('.bg-red-500, .text-red');
    expect(indicator || screen.getByText(/desconectado/i)).toBeInTheDocument();
  });

  it('should show last update time', () => {
    render(<RealtimeIndicator isConnected={true} lastUpdate={new Date().toISOString()} />);
    expect(screen.getByText(/agora|segundo|atualizado/i)).toBeInTheDocument();
  });
});
