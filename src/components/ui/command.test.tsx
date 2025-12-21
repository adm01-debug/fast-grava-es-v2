import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

describe('command', () => {
  it('should render without crashing', async () => {
    const mod = await import('./command');
    const Component = Object.values(mod)[0] as any;
    if (Component) expect(() => render(<Component />)).not.toThrow();
  });
});
