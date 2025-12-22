import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOperatorMachines } from './useOperatorMachines';

describe('useOperatorMachines', () => {
  it('should be defined', () => { expect(useOperatorMachines).toBeDefined(); });
});
