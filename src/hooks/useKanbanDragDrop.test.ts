import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKanbanDragDrop } from './useKanbanDragDrop';

describe('useKanbanDragDrop', () => {
  it('should be defined', () => { expect(useKanbanDragDrop).toBeDefined(); });
});
