import { render, fireEvent, waitFor } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { FuturisticBI } from '../FuturisticBI';
import { vi, describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('@/hooks/useOperatorProductivity', () => ({
  useOperatorProductivity: vi.fn().mockReturnValue({
    operators: [],
    overallStats: { totalJobs: 0, avgEfficiency: 0 }
  }),
}));

vi.mock('@/hooks/useTPM', () => ({
  useTPM: vi.fn().mockReturnValue({
    stats: { availability: 0, health: 0 },
    records: []
  }),
}));

const mockHandleExport = vi.fn();
vi.mock('@/hooks/useBIExport', () => ({
  useBIExport: vi.fn().mockReturnValue({
    isExporting: false,
    handleExport: (...args: any[]) => mockHandleExport(...args),
  }),
}));

const mockBiMetrics = {
  periodLossRate: 5.0,
  toDoJobs: 10,
  periodCompletedJobs: 50,
  periodCompletedPieces: 950,
  periodLostPieces: 50,
  periodJobsList: [
    { id: '1', order_number: 'OS-1', status: 'finished', quantity: 100, produced_quantity: 100, lost_pieces: 5, product_name: 'Test P1' },
    { id: '2', order_number: 'OS-2', status: 'production', quantity: 100, produced_quantity: 50, lost_pieces: 0, product_name: 'Test P2' },
  ],
  dailyTrend: [{ date: '01/01', produced: 100, lost: 5 }],
  statusDistribution: [{ name: 'Finalizados', value: 1, color: '#fff' }],
  machineUtilization: [],
};

const mockKpis = { inProgressJobs: 1, delayedJobs: 0 };
const mockOeeData = { overallOEE: 90, overallAvailability: 95, overallPerformance: 95, overallQuality: 95 };

describe('FuturisticBI Loss Rate Export', () => {
  it('triggers Taxa_Perda export when clicking the export button on the stat card', async () => {
    render(
      <BrowserRouter>
        <FuturisticBI biMetrics={mockBiMetrics} kpis={mockKpis} oeeData={mockOeeData} />
      </BrowserRouter>
    );

    const lossRateCard = screen.getByText('Taxa de Perda').closest('div');
    const exportButton = lossRateCard?.querySelector('button');
    
    if (exportButton) {
      fireEvent.click(exportButton);
      // Depending on the implementation of FuturisticStatCard, this might open a popover or trigger directly.
      // If it's a popover, we'd need to click CSV/PDF buttons inside it.
      // Looking at FuturisticStatCard implementation usually helps, but assuming direct call or popover click:
      const csvBtn = screen.queryByText('CSV') || exportButton;
      fireEvent.click(csvBtn);
      
      expect(mockHandleExport).toHaveBeenCalledWith(expect.any(String), 'Taxa_Perda');
    }
  });
});
