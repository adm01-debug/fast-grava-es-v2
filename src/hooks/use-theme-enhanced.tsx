import * as React from 'react';

type Theme = 'light' | 'dark' | 'system';
type ColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'orange';

interface ThemeConfig {
  theme: Theme;
  colorScheme: ColorScheme;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
}

interface ThemeContextValue {
  config: ThemeConfig;
  setTheme: (theme: Theme) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setReducedMotion: (reduced: boolean) => void;
  setHighContrast: (high: boolean) => void;
  setFontSize: (size: ThemeConfig['fontSize']) => void;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'theme-config';

const defaultConfig: ThemeConfig = {
  theme: 'system',
  colorScheme: 'default',
  reducedMotion: false,
  highContrast: false,
  fontSize: 'base',
};

export function EnhancedThemeProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = React.useState<ThemeConfig>(() => {
    if (typeof window === 'undefined') return defaultConfig;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultConfig, ...JSON.parse(stored) } : defaultConfig;
  });

  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>('light');

  // Listen for system theme changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateResolvedTheme = () => {
      if (config.theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      } else {
        setResolvedTheme(config.theme as 'light' | 'dark');
      }
    };

    updateResolvedTheme();
    mediaQuery.addEventListener('change', updateResolvedTheme);
    return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
  }, [config.theme]);

  // Apply theme to document
  React.useEffect(() => {
    const root = document.documentElement;
    
    // Theme class
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);

    // Color scheme
    root.setAttribute('data-color-scheme', config.colorScheme);

    // Reduced motion
    if (config.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // High contrast
    if (config.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Font size
    root.setAttribute('data-font-size', config.fontSize);
    const fontSizeMap = { sm: '14px', base: '16px', lg: '18px', xl: '20px' };
    root.style.fontSize = fontSizeMap[config.fontSize];

    // Persist config
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config, resolvedTheme]);

  const setTheme = React.useCallback((theme: Theme) => {
    setConfig(prev => ({ ...prev, theme }));
  }, []);

  const setColorScheme = React.useCallback((colorScheme: ColorScheme) => {
    setConfig(prev => ({ ...prev, colorScheme }));
  }, []);

  const setReducedMotion = React.useCallback((reducedMotion: boolean) => {
    setConfig(prev => ({ ...prev, reducedMotion }));
  }, []);

  const setHighContrast = React.useCallback((highContrast: boolean) => {
    setConfig(prev => ({ ...prev, highContrast }));
  }, []);

  const setFontSize = React.useCallback((fontSize: ThemeConfig['fontSize']) => {
    setConfig(prev => ({ ...prev, fontSize }));
  }, []);

  const toggleTheme = React.useCallback(() => {
    setConfig(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : prev.theme === 'light' ? 'dark' : 'light',
    }));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        config,
        setTheme,
        setColorScheme,
        setReducedMotion,
        setHighContrast,
        setFontSize,
        resolvedTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useEnhancedTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useEnhancedTheme must be used within EnhancedThemeProvider');
  }
  return context;
}

// Theme toggle component with animation
import { Moon, Sun, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function ThemeToggle({ className, showLabel = false, size = 'default' }: ThemeToggleProps) {
  const { config, setTheme, resolvedTheme } = useEnhancedTheme();

  const themes: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun className="h-4 w-4" />, label: 'Claro' },
    { value: 'dark', icon: <Moon className="h-4 w-4" />, label: 'Escuro' },
    { value: 'system', icon: <Monitor className="h-4 w-4" />, label: 'Sistema' },
  ];

  const currentIndex = themes.findIndex(t => t.value === config.theme);

  const cycleTheme = () => {
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={cycleTheme}
      className={cn("relative overflow-hidden", className)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={config.theme}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2"
        >
          {themes[currentIndex].icon}
          {showLabel && <span>{themes[currentIndex].label}</span>}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}

// Theme settings panel
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

export function ThemeSettingsPanel({ className }: { className?: string }) {
  const { 
    config, 
    setTheme, 
    setReducedMotion, 
    setHighContrast, 
    setFontSize 
  } = useEnhancedTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Aparência</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-2 space-y-4">
          {/* Theme selection */}
          <div className="space-y-2">
            <Label className="text-xs">Tema</Label>
            <div className="flex gap-1">
              {(['light', 'dark', 'system'] as Theme[]).map((theme) => (
                <Button
                  key={theme}
                  variant={config.theme === theme ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme(theme)}
                  className="flex-1"
                >
                  {theme === 'light' && <Sun className="h-3 w-3" />}
                  {theme === 'dark' && <Moon className="h-3 w-3" />}
                  {theme === 'system' && <Monitor className="h-3 w-3" />}
                </Button>
              ))}
            </div>
          </div>

          {/* Font size */}
          <div className="space-y-2">
            <Label className="text-xs">Tamanho da fonte</Label>
            <div className="flex gap-1">
              {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
                <Button
                  key={size}
                  variant={config.fontSize === size ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFontSize(size)}
                  className="flex-1 text-xs"
                >
                  {size.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Accessibility options */}
          <div className="flex items-center justify-between">
            <Label htmlFor="reduced-motion" className="text-xs">
              Reduzir animações
            </Label>
            <Switch
              id="reduced-motion"
              checked={config.reducedMotion}
              onCheckedChange={setReducedMotion}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast" className="text-xs">
              Alto contraste
            </Label>
            <Switch
              id="high-contrast"
              checked={config.highContrast}
              onCheckedChange={setHighContrast}
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
