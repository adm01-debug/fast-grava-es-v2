import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TPMScheduleList } from './TPMScheduleList';

const mockSchedules = [
  { id: '1', machine: 'CNC-01', type: 'preventive', date: '2024-02-01', status: 'scheduled' },
];

describe('TPMScheduleList', () => {
  it('should render schedules', () => {
    render(<TPMScheduleList schedules={mockSchedules} />);
    expect(screen.getByText('CNC-01')).toBeInTheDocument();
  });
  it('should show type', () => {
    render(<TPMScheduleList schedules={mockSchedules} />);
    expect(screen.getByText(/preventiva|preventive/i)).toBeInTheDocument();
  });
});
