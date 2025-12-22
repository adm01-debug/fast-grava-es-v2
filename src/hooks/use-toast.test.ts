import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { use-toast } from './use-toast';

describe('use-toast', () => {
  it('should be defined', () => { expect(use-toast).toBeDefined(); });
});
