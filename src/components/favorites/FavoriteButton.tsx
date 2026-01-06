import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  pageId: string;
  pageName: string;
  pageUrl: string;
  className?: string;
}

interface FavoriteItem {
  id: string;
  name: string;
  url: string;
  addedAt: string;
}

const FAVORITES_KEY = 'user-favorites';

export function FavoriteButton({ pageId, pageName, pageUrl, className }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = getFavorites();
    setIsFavorite(favorites.some(f => f.id === pageId));
  }, [pageId]);

  const getFavorites = (): FavoriteItem[] => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const toggleFavorite = () => {
    const favorites = getFavorites();
    
    if (isFavorite) {
      const updated = favorites.filter(f => f.id !== pageId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      setIsFavorite(false);
      toast.success('Removido dos favoritos');
    } else {
      const newFavorite: FavoriteItem = {
        id: pageId,
        name: pageName,
        url: pageUrl,
        addedAt: new Date().toISOString(),
      };
      const updated = [...favorites, newFavorite];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      setIsFavorite(true);
      toast.success('Adicionado aos favoritos');
    }

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('favorites-updated'));
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFavorite}
      className={cn(
        "h-8 w-8 transition-all duration-200",
        isFavorite && "text-yellow-500",
        className
      )}
      title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Star 
        className={cn(
          "h-4 w-4 transition-all duration-200",
          isFavorite ? "fill-current" : ""
        )} 
      />
    </Button>
  );
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const loadFavorites = () => {
      try {
        const stored = localStorage.getItem(FAVORITES_KEY);
        setFavorites(stored ? JSON.parse(stored) : []);
      } catch {
        setFavorites([]);
      }
    };

    loadFavorites();
    window.addEventListener('favorites-updated', loadFavorites);
    return () => window.removeEventListener('favorites-updated', loadFavorites);
  }, []);

  return favorites;
}
