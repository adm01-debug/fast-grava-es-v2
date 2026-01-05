import { Button } from '@/components/ui/button';
import { Copy, Loader2 } from 'lucide-react';
import { useDuplicate } from '@/hooks/useDuplicate';

interface DuplicateButtonProps<T extends { id: string }> {
  item: T;
  tableName: string;
  queryKey: string[];
  onSuccess?: (newItem: T) => void;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'icon';
}

export function DuplicateButton<T extends { id: string }>({
  item, tableName, queryKey, onSuccess, variant = 'ghost', size = 'icon'
}: DuplicateButtonProps<T>) {
  const { duplicate, isDuplicating } = useDuplicate<T>({ tableName, queryKey });

  const handleDuplicate = () => {
    duplicate(item.id, {
      onSuccess: (data) => {
        if (onSuccess) onSuccess(data);
      }
    });
  };

  return (
    <Button variant={variant} size={size} onClick={handleDuplicate} disabled={isDuplicating} title="Duplicar">
      {isDuplicating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}
