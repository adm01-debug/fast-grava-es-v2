import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

describe('input-otp', () => {
  it('should render without crashing', async () => {
    const mod = await import('./input-otp');
    const Component = Object.values(mod)[0] as any;
    if (Component) expect(() => render(<Component />)).not.toThrow();
  });
});
