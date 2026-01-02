import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SearchProvider, useSearch } from './SearchContext';
import React from 'react';

const TestComponent = () => {
  const { query, setQuery, results } = useSearch();
  return (
    <div>
      <span data-testid="query">{query}</span>
      <button onClick={() => setQuery('test')}>Search</button>
    </div>
  );
};

describe('SearchContext', () => {
  it('provides search context', () => {
    render(<SearchProvider><TestComponent /></SearchProvider>);
    expect(screen.getByTestId('query').textContent).toBe('');
  });

  it('updates search query', () => {
    render(<SearchProvider><TestComponent /></SearchProvider>);
    act(() => screen.getByText('Search').click());
    expect(screen.getByTestId('query').textContent).toBe('test');
  });
});
