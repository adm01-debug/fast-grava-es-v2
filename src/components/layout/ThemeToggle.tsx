import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    setIsAnimating(true);
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
        <span className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={`
        relative h-9 w-9 overflow-hidden
        transition-all duration-300 ease-out
        hover:bg-accent/80
        ${isAnimating ? 'scale-95' : 'scale-100'}
      `}
      title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
    >
      {/* Sun icon */}
      <Sun 
        className={`
          absolute h-4 w-4
          ${isDark 
            ? 'rotate-90 scale-0 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]' 
            : 'scale-100 opacity-100 animate-[spin_8s_linear_infinite]'
          }
        `}
        style={{
          filter: isDark ? 'none' : 'drop-shadow(0 0 6px hsl(var(--warning) / 0.6))'
        }}
      />
      
      {/* Moon icon */}
      <Moon 
        className={`
          absolute h-4 w-4
          transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isDark 
            ? 'rotate-0 scale-100 opacity-100' 
            : '-rotate-90 scale-0 opacity-0'
          }
        `}
        style={{
          filter: isDark ? 'drop-shadow(0 0 4px hsl(var(--primary) / 0.5))' : 'none'
        }}
      />

      {/* Ripple effect on click */}
      {isAnimating && (
        <span 
          className={`
            absolute inset-0 rounded-md
            animate-ping
            ${isDark ? 'bg-primary/20' : 'bg-warning/20'}
          `}
          style={{ animationDuration: '400ms', animationIterationCount: 1 }}
        />
      )}

      <span className="sr-only">
        {isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      </span>
    </Button>
  );
}
