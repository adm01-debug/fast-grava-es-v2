import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

describe('scroll-area', () => {
  it('should render without crashing', async () => {
    const mod = await import('./scroll-area');
    const Component = Object.values(mod)[0] as any;
    if (Component) expect(() => render(<Component />)).not.toThrow();
  });
});
