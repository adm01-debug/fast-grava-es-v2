import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Bitrix24FieldMapping } from './Bitrix24FieldMapping';

const mockFields = [
  { bitrixField: 'TITLE', localField: 'order_number', label: 'Número do Pedido' },
  { bitrixField: 'COMPANY_ID', localField: 'client_id', label: 'Cliente' },
];

describe('Bitrix24FieldMapping', () => {
  it('should render field mappings', () => {
    render(<Bitrix24FieldMapping fields={mockFields} />);
    expect(screen.getByText('Número do Pedido')).toBeInTheDocument();
  });

  it('should show Bitrix field names', () => {
    render(<Bitrix24FieldMapping fields={mockFields} />);
    expect(screen.getByText('TITLE')).toBeInTheDocument();
  });

  it('should show local field names', () => {
    render(<Bitrix24FieldMapping fields={mockFields} />);
    expect(screen.getByText('order_number')).toBeInTheDocument();
  });

  it('should allow editing mappings', () => {
    render(<Bitrix24FieldMapping fields={mockFields} editable />);
    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0);
  });
});
