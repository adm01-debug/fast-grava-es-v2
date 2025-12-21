import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

describe('calendar', () => {
  it('should render without crashing', async () => {
    const mod = await import('./calendar');
    const Component = Object.values(mod)[0] as any;
    if (Component) expect(() => render(<Component />)).not.toThrow();
  });
});
