import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function ThemeTransitionOverlay({ isVisible, isDark }: { isVisible: boolean; isDark: boolean }) {
  if (typeof document === 'undefined') return null;
  
  return createPortal(
    <div
      className={`
        fixed inset-0 pointer-events-none z-[9999]
        transition-opacity duration-500 ease-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
      style={{
        background: isDark 
          ? 'radial-gradient(circle at center, hsl(var(--primary) / 0.15) 0%, hsl(222 47% 8% / 0.4) 100%)'
          : 'radial-gradient(circle at center, hsl(var(--warning) / 0.2) 0%, hsl(220 20% 97% / 0.5) 100%)',
        backdropFilter: isVisible ? 'blur(2px)' : 'blur(0px)',
      }}
    />,
    document.body
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    setShowOverlay(true);
    setIsAnimating(true);
    
    // Slight delay before theme change for cinematic effect
    setTimeout(() => {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    }, 150);
    
    // Hide overlay after transition
    setTimeout(() => {
      setShowOverlay(false);
      setIsAnimating(false);
    }, 600);
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
    <>
      <ThemeTransitionOverlay isVisible={showOverlay} isDark={!isDark} />
      
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
            ${isDark 
              ? 'rotate-0 scale-100 opacity-100 animate-[pulse_3s_ease-in-out_infinite]' 
              : '-rotate-90 scale-0 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]'
            }
          `}
          style={{
            filter: isDark ? 'drop-shadow(0 0 8px hsl(var(--primary) / 0.6))' : 'none'
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
    </>
  );
}
