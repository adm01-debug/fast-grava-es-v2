import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDocuments } from './useDocuments';

describe('useDocuments', () => {
  it('should be defined', () => { expect(useDocuments).toBeDefined(); });
});
