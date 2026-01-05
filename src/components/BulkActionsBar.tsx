/**
 * Simple Bulk Actions Bar Component
 * 
 * @module components/BulkActionsBar
 */

import { Button } from '@/components/ui/button';
import { X, CheckSquare } from 'lucide-react';
import { ReactNode } from 'react';

interface BulkAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
}

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: BulkAction[];
  isProcessing?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  actions,
  isProcessing = false,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
      <CheckSquare className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">
        {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
      </span>
      
      <div className="flex-1" />
      
      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.key}
            variant={action.variant || 'outline'}
            size="sm"
            onClick={action.onClick}
            disabled={isProcessing}
            className="gap-2"
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClearSelection}
          disabled={isProcessing}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default BulkActionsBar;
