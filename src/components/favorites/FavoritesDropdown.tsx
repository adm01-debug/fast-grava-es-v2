import { Star, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFavorites } from './FavoriteButton';
import { cn } from '@/lib/utils';

interface FavoritesDropdownProps {
  onNavigate: (url: string) => void;
  className?: string;
}

export function FavoritesDropdown({ onNavigate, className }: FavoritesDropdownProps) {
  const favorites = useFavorites();

  const removeFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('user-favorites');
      const current = stored ? JSON.parse(stored) : [];
      const updated = current.filter((f: any) => f.id !== id);
      localStorage.setItem('user-favorites', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('favorites-updated'));
    } catch {
      // ignore
    }
  };

  if (favorites.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn("gap-1.5 text-xs", className)}
        >
          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
          <span className="hidden sm:inline">Favoritos</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Páginas Favoritas
        </div>
        <DropdownMenuSeparator />
        {favorites.map((favorite) => (
          <DropdownMenuItem
            key={favorite.id}
            onClick={() => onNavigate(favorite.url)}
            className="flex items-center justify-between group cursor-pointer"
          >
            <span className="truncate">{favorite.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => removeFavorite(favorite.id, e)}
            >
              <X className="h-3 w-3" />
            </Button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
