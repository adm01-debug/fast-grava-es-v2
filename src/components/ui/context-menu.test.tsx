import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

describe('context-menu', () => {
  it('should render without crashing', async () => {
    const mod = await import('./context-menu');
    const Component = Object.values(mod)[0] as any;
    if (Component) expect(() => render(<Component />)).not.toThrow();
  });
});
