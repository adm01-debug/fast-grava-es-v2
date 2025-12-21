import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserManagement } from './UserManagement';

const mockUsers = [
  { id: '1', name: 'Admin', email: 'admin@test.com', role: 'admin' },
  { id: '2', name: 'User', email: 'user@test.com', role: 'user' },
];

describe('UserManagement', () => {
  it('should render users table', () => {
    render(<UserManagement users={mockUsers} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
  it('should show user names', () => {
    render(<UserManagement users={mockUsers} />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });
});
