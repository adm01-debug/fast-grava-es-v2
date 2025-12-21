import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

describe('toaster', () => {
  it('should render without crashing', async () => {
    const mod = await import('./toaster');
    const Component = Object.values(mod)[0] as any;
    if (Component) expect(() => render(<Component />)).not.toThrow();
  });
});
