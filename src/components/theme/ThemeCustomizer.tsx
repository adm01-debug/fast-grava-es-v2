import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  RotateCcw, 
  Download, 
  Upload,
  Check,
  Paintbrush,
  Type,
  Layers,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
}

interface ThemeConfig {
  name: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  borderRadius: number;
  fontSize: number;
  spacing: number;
  fontFamily: string;
  animations: boolean;
  glassmorphism: boolean;
}

interface ThemeCustomizerContextType {
  theme: ThemeConfig;
  updateColors: (mode: 'light' | 'dark', colors: Partial<ThemeColors>) => void;
  updateConfig: (config: Partial<Omit<ThemeConfig, 'colors'>>) => void;
  resetTheme: () => void;
  exportTheme: () => string;
  importTheme: (json: string) => boolean;
  presets: ThemePreset[];
  applyPreset: (presetId: string) => void;
}

interface ThemePreset {
  id: string;
  name: string;
  preview: { primary: string; secondary: string; accent: string };
  config: ThemeConfig;
}

// Default theme
const defaultTheme: ThemeConfig = {
  name: 'Default',
  colors: {
    light: {
      primary: '222 47% 11%',
      secondary: '210 40% 96%',
      accent: '210 40% 96%',
      background: '0 0% 100%',
      foreground: '222 47% 11%',
      muted: '210 40% 96%',
      border: '214 32% 91%',
    },
    dark: {
      primary: '210 40% 98%',
      secondary: '217 33% 17%',
      accent: '217 33% 17%',
      background: '222 47% 11%',
      foreground: '210 40% 98%',
      muted: '217 33% 17%',
      border: '217 33% 17%',
    },
  },
  borderRadius: 8,
  fontSize: 16,
  spacing: 4,
  fontFamily: 'Inter',
  animations: true,
  glassmorphism: false,
};

// Presets
const themePresets: ThemePreset[] = [
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    preview: { primary: '#0ea5e9', secondary: '#7dd3fc', accent: '#38bdf8' },
    config: {
      ...defaultTheme,
      name: 'Ocean Breeze',
      colors: {
        light: {
          primary: '199 89% 48%',
          secondary: '199 92% 74%',
          accent: '198 93% 60%',
          background: '0 0% 100%',
          foreground: '199 89% 20%',
          muted: '199 30% 95%',
          border: '199 30% 85%',
        },
        dark: {
          primary: '199 89% 60%',
          secondary: '199 50% 25%',
          accent: '198 93% 50%',
          background: '199 50% 10%',
          foreground: '199 20% 95%',
          muted: '199 30% 20%',
          border: '199 30% 25%',
        },
      },
    },
  },
  {
    id: 'forest',
    name: 'Forest Green',
    preview: { primary: '#22c55e', secondary: '#86efac', accent: '#4ade80' },
    config: {
      ...defaultTheme,
      name: 'Forest Green',
      colors: {
        light: {
          primary: '142 71% 45%',
          secondary: '142 69% 73%',
          accent: '142 69% 58%',
          background: '0 0% 100%',
          foreground: '142 71% 15%',
          muted: '142 30% 95%',
          border: '142 30% 85%',
        },
        dark: {
          primary: '142 71% 55%',
          secondary: '142 40% 25%',
          accent: '142 69% 48%',
          background: '142 40% 8%',
          foreground: '142 20% 95%',
          muted: '142 30% 18%',
          border: '142 30% 25%',
        },
      },
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    preview: { primary: '#f97316', secondary: '#fdba74', accent: '#fb923c' },
    config: {
      ...defaultTheme,
      name: 'Sunset Glow',
      colors: {
        light: {
          primary: '25 95% 53%',
          secondary: '27 96% 72%',
          accent: '27 96% 61%',
          background: '0 0% 100%',
          foreground: '25 95% 20%',
          muted: '25 30% 95%',
          border: '25 30% 85%',
        },
        dark: {
          primary: '25 95% 60%',
          secondary: '25 50% 25%',
          accent: '27 96% 50%',
          background: '25 50% 8%',
          foreground: '25 20% 95%',
          muted: '25 30% 18%',
          border: '25 30% 25%',
        },
      },
    },
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    preview: { primary: '#a855f7', secondary: '#d8b4fe', accent: '#c084fc' },
    config: {
      ...defaultTheme,
      name: 'Royal Purple',
      colors: {
        light: {
          primary: '271 91% 65%',
          secondary: '270 95% 85%',
          accent: '270 95% 75%',
          background: '0 0% 100%',
          foreground: '271 91% 20%',
          muted: '271 30% 95%',
          border: '271 30% 85%',
        },
        dark: {
          primary: '271 91% 70%',
          secondary: '271 50% 25%',
          accent: '270 95% 60%',
          background: '271 50% 8%',
          foreground: '271 20% 95%',
          muted: '271 30% 18%',
          border: '271 30% 25%',
        },
      },
    },
  },
  {
    id: 'rose',
    name: 'Rose Garden',
    preview: { primary: '#f43f5e', secondary: '#fda4af', accent: '#fb7185' },
    config: {
      ...defaultTheme,
      name: 'Rose Garden',
      colors: {
        light: {
          primary: '350 89% 60%',
          secondary: '351 90% 82%',
          accent: '350 91% 72%',
          background: '0 0% 100%',
          foreground: '350 89% 20%',
          muted: '350 30% 95%',
          border: '350 30% 85%',
        },
        dark: {
          primary: '350 89% 65%',
          secondary: '350 50% 25%',
          accent: '350 91% 55%',
          background: '350 50% 8%',
          foreground: '350 20% 95%',
          muted: '350 30% 18%',
          border: '350 30% 25%',
        },
      },
    },
  },
];

// Context
const ThemeCustomizerContext = createContext<ThemeCustomizerContextType | null>(null);

export function useThemeCustomizer() {
  const context = useContext(ThemeCustomizerContext);
  if (!context) {
    throw new Error('useThemeCustomizer must be used within ThemeCustomizerProvider');
  }
  return context;
}

// Provider
export function ThemeCustomizerProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('custom-theme');
    return saved ? JSON.parse(saved) : defaultTheme;
  });

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const colors = isDark ? theme.colors.dark : theme.colors.light;

    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--foreground', colors.foreground);
    root.style.setProperty('--muted', colors.muted);
    root.style.setProperty('--border', colors.border);
    root.style.setProperty('--radius', `${theme.borderRadius}px`);
    root.style.fontSize = `${theme.fontSize}px`;

    localStorage.setItem('custom-theme', JSON.stringify(theme));
  }, [theme]);

  const updateColors = useCallback((mode: 'light' | 'dark', colors: Partial<ThemeColors>) => {
    setTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [mode]: { ...prev.colors[mode], ...colors },
      },
    }));
  }, []);

  const updateConfig = useCallback((config: Partial<Omit<ThemeConfig, 'colors'>>) => {
    setTheme(prev => ({ ...prev, ...config }));
  }, []);

  const resetTheme = useCallback(() => {
    setTheme(defaultTheme);
  }, []);

  const exportTheme = useCallback(() => {
    return JSON.stringify(theme, null, 2);
  }, [theme]);

  const importTheme = useCallback((json: string): boolean => {
    try {
      const imported = JSON.parse(json);
      setTheme(imported);
      return true;
    } catch {
      return false;
    }
  }, []);

  const applyPreset = useCallback((presetId: string) => {
    const preset = themePresets.find(p => p.id === presetId);
    if (preset) {
      setTheme(preset.config);
    }
  }, []);

  return (
    <ThemeCustomizerContext.Provider
      value={{
        theme,
        updateColors,
        updateConfig,
        resetTheme,
        exportTheme,
        importTheme,
        presets: themePresets,
        applyPreset,
      }}
    >
      {children}
    </ThemeCustomizerContext.Provider>
  );
}

// Color Picker Component
function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  // Convert HSL string to hex for color input
  const hslToHex = (hsl: string): string => {
    const [h, s, l] = hsl.split(' ').map(v => parseFloat(v));
    const sNorm = s / 100;
    const lNorm = l / 100;
    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lNorm - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
        case g: h = ((b - r) / d + 2) * 60; break;
        case b: h = ((r - g) / d + 4) * 60; break;
      }
    }
    return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg border border-border shadow-sm cursor-pointer"
        style={{ backgroundColor: `hsl(${value})` }}
      >
        <input
          type="color"
          value={hslToHex(value)}
          onChange={(e) => onChange(hexToHsl(e.target.value))}
          className="w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex-1">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

// Preset Card
function PresetCard({
  preset,
  isActive,
  onSelect,
}: {
  preset: ThemePreset;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative p-3 rounded-lg border-2 transition-all hover:scale-105',
        isActive ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
      )}
    >
      <div className="flex gap-1 mb-2">
        <div
          className="w-6 h-6 rounded-full"
          style={{ backgroundColor: preset.preview.primary }}
        />
        <div
          className="w-6 h-6 rounded-full"
          style={{ backgroundColor: preset.preview.secondary }}
        />
        <div
          className="w-6 h-6 rounded-full"
          style={{ backgroundColor: preset.preview.accent }}
        />
      </div>
      <p className="text-xs font-medium">{preset.name}</p>
      {isActive && (
        <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
    </button>
  );
}

// Main Customizer Panel
export function ThemeCustomizerPanel() {
  const {
    theme,
    updateColors,
    updateConfig,
    resetTheme,
    exportTheme,
    importTheme,
    presets,
    applyPreset,
  } = useThemeCustomizer();

  const handleExport = () => {
    const json = exportTheme();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          importTheme(reader.result as string);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="presets" className="gap-1">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Presets</span>
          </TabsTrigger>
          <TabsTrigger value="colors" className="gap-1">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Cores</span>
          </TabsTrigger>
          <TabsTrigger value="typography" className="gap-1">
            <Type className="w-4 h-4" />
            <span className="hidden sm:inline">Tipografia</span>
          </TabsTrigger>
          <TabsTrigger value="layout" className="gap-1">
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Layout</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {presets.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                isActive={theme.name === preset.name}
                onSelect={() => applyPreset(preset.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="colors" className="mt-4 space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Sun className="w-4 h-4" /> Modo Claro
            </h4>
            <div className="grid gap-3">
              <ColorInput
                label="Primária"
                value={theme.colors.light.primary}
                onChange={(v) => updateColors('light', { primary: v })}
              />
              <ColorInput
                label="Secundária"
                value={theme.colors.light.secondary}
                onChange={(v) => updateColors('light', { secondary: v })}
              />
              <ColorInput
                label="Accent"
                value={theme.colors.light.accent}
                onChange={(v) => updateColors('light', { accent: v })}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Moon className="w-4 h-4" /> Modo Escuro
            </h4>
            <div className="grid gap-3">
              <ColorInput
                label="Primária"
                value={theme.colors.dark.primary}
                onChange={(v) => updateColors('dark', { primary: v })}
              />
              <ColorInput
                label="Secundária"
                value={theme.colors.dark.secondary}
                onChange={(v) => updateColors('dark', { secondary: v })}
              />
              <ColorInput
                label="Accent"
                value={theme.colors.dark.accent}
                onChange={(v) => updateColors('dark', { accent: v })}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="typography" className="mt-4 space-y-4">
          <div>
            <Label className="text-sm font-medium">Tamanho da Fonte Base</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[theme.fontSize]}
                onValueChange={([v]) => updateConfig({ fontSize: v })}
                min={12}
                max={20}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">{theme.fontSize}px</span>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Família da Fonte</Label>
            <select
              value={theme.fontFamily}
              onChange={(e) => updateConfig({ fontFamily: e.target.value })}
              className="w-full mt-2 px-3 py-2 rounded-md border border-border bg-background"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Poppins">Poppins</option>
              <option value="Montserrat">Montserrat</option>
            </select>
          </div>
        </TabsContent>

        <TabsContent value="layout" className="mt-4 space-y-4">
          <div>
            <Label className="text-sm font-medium">Border Radius</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[theme.borderRadius]}
                onValueChange={([v]) => updateConfig({ borderRadius: v })}
                min={0}
                max={24}
                step={2}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">{theme.borderRadius}px</span>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Espaçamento</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[theme.spacing]}
                onValueChange={([v]) => updateConfig({ spacing: v })}
                min={2}
                max={8}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">{theme.spacing}px</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Animações</Label>
              <p className="text-xs text-muted-foreground">Ativar animações de transição</p>
            </div>
            <Switch
              checked={theme.animations}
              onCheckedChange={(v) => updateConfig({ animations: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Glassmorphism</Label>
              <p className="text-xs text-muted-foreground">Efeito de vidro fosco</p>
            </div>
            <Switch
              checked={theme.glassmorphism}
              onCheckedChange={(v) => updateConfig({ glassmorphism: v })}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 pt-4 border-t border-border">
        <Button variant="outline" size="sm" onClick={resetTheme}>
          <RotateCcw className="w-4 h-4 mr-1" /> Reset
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-1" /> Exportar
        </Button>
        <Button variant="outline" size="sm" onClick={handleImport}>
          <Upload className="w-4 h-4 mr-1" /> Importar
        </Button>
      </div>
    </div>
  );
}

// Sheet Trigger
export function ThemeCustomizerSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg">
          <Paintbrush className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" /> Personalizar Tema
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          <ThemeCustomizerPanel />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// Preview Component
export function ThemePreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview do Tema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button>Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-foreground">Texto no fundo muted</p>
          <p className="text-muted-foreground">Texto muted</p>
        </div>
        <div className="flex gap-2">
          <div className="w-12 h-12 rounded-lg bg-primary" />
          <div className="w-12 h-12 rounded-lg bg-secondary" />
          <div className="w-12 h-12 rounded-lg bg-accent" />
          <div className="w-12 h-12 rounded-lg bg-muted" />
          <div className="w-12 h-12 rounded-lg border border-border" />
        </div>
      </CardContent>
    </Card>
  );
}
