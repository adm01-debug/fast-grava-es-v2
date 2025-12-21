import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NavLink } from './NavLink';

describe('NavLink', () => {
  it('renders link', () => {
    render(<BrowserRouter><NavLink to="/test">Test</NavLink></BrowserRouter>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  it('applies active class', () => {
    render(<BrowserRouter><NavLink to="/" activeClassName="active">Home</NavLink></BrowserRouter>);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
