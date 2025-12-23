import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { VirtualizedList } from './virtualized-list';

interface TestItem {
  id: number;
  text: string;
}

describe('VirtualizedList', () => {
  it('renders list', () => {
    const items: TestItem[] = Array.from({ length: 100 }, (_, i) => ({ id: i, text: `Item ${i}` }));
    const { container } = render(
      <VirtualizedList<TestItem> 
        data={items} 
        renderItem={(item) => <div>{item.text}</div>} 
        itemHeight={40} 
        maxHeight={400} 
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    const { container } = render(
      <VirtualizedList<TestItem> 
        data={[]} 
        renderItem={(item) => <div>{item.text}</div>} 
        emptyMessage="Lista vazia"
      />
    );
    expect(container.textContent).toContain('Lista vazia');
  });
});
