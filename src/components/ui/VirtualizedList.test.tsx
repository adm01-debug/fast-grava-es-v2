import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { VirtualizedList } from './virtualized-list';

describe('VirtualizedList', () => {
  it('renders list', () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ id: i, text: `Item ${i}` }));
    const { container } = render(<VirtualizedList items={items} renderItem={(item) => <div>{item.text}</div>} height={400} itemHeight={40} />);
    expect(container).toBeInTheDocument();
  });
});
