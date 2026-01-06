import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, Pipette, RefreshCw, Palette, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

// Types
interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  format?: 'hex' | 'rgb' | 'hsl';
  presets?: string[];
  showPresets?: boolean;
  showInput?: boolean;
  showOpacity?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

// Color conversion utilities
const hexToRgb = (hex: string): RGB | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
};

const rgbToHsl = (r: number, g: number, b: number): HSL => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const hslToRgb = (h: number, s: number, l: number): RGB => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

// Default presets
const defaultPresets = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#78716c', '#71717a', '#000000',
];

// Size configurations
const sizeConfig = {
  sm: { trigger: 'h-8 w-8', popover: 'w-56' },
  md: { trigger: 'h-10 w-10', popover: 'w-64' },
  lg: { trigger: 'h-12 w-12', popover: 'w-72' },
};

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '#3b82f6',
  onChange,
  format = 'hex',
  presets = defaultPresets,
  showPresets = true,
  showInput = true,
  showOpacity = false,
  size = 'md',
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hsl, setHsl] = useState<HSL>({ h: 217, s: 91, l: 60 });
  const [opacity, setOpacity] = useState(100);
  const [inputValue, setInputValue] = useState(value);
  const { toast } = useToast();
  const config = sizeConfig[size];

  // Parse initial value
  useEffect(() => {
    const rgb = hexToRgb(value);
    if (rgb) {
      setHsl(rgbToHsl(rgb.r, rgb.g, rgb.b));
      setInputValue(value);
    }
  }, [value]);

  // Get current color in different formats
  const getCurrentColor = useCallback(() => {
    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    switch (format) {
      case 'rgb':
        return opacity < 100
          ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity / 100})`
          : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      case 'hsl':
        return opacity < 100
          ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${opacity / 100})`
          : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
      default:
        return hex;
    }
  }, [hsl, opacity, format]);

  // Update color
  const updateColor = useCallback(
    (newHsl: Partial<HSL>) => {
      const updated = { ...hsl, ...newHsl };
      setHsl(updated);
      const rgb = hslToRgb(updated.h, updated.s, updated.l);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      setInputValue(hex);
      onChange?.(getCurrentColor());
    },
    [hsl, onChange, getCurrentColor]
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      const rgb = hexToRgb(newValue);
      if (rgb) {
        setHsl(rgbToHsl(rgb.r, rgb.g, rgb.b));
        onChange?.(newValue);
      }
    }
  };

  // Handle preset click
  const handlePresetClick = (color: string) => {
    const rgb = hexToRgb(color);
    if (rgb) {
      setHsl(rgbToHsl(rgb.r, rgb.g, rgb.b));
      setInputValue(color);
      onChange?.(color);
    }
  };

  // Copy color
  const copyColor = () => {
    navigator.clipboard.writeText(getCurrentColor());
    toast({ title: 'Cor copiada!', description: getCurrentColor() });
  };

  // Random color
  const randomColor = () => {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 40) + 60;
    const l = Math.floor(Math.random() * 40) + 30;
    updateColor({ h, s, l });
  };

  const currentHex = rgbToHex(
    ...Object.values(hslToRgb(hsl.h, hsl.s, hsl.l)) as [number, number, number]
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            config.trigger,
            'rounded-lg border-2 border-border shadow-sm transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          style={{ backgroundColor: currentHex }}
        />
      </PopoverTrigger>
      <PopoverContent className={cn(config.popover, 'p-3')} align="start">
        <Tabs defaultValue="picker" className="w-full">
          <TabsList className="w-full mb-3">
            <TabsTrigger value="picker" className="flex-1">
              <Palette className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="sliders" className="flex-1">
              <ChevronDown className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="picker" className="space-y-3">
            {/* Saturation/Lightness picker */}
            <div
              className="relative h-32 rounded-lg cursor-crosshair"
              style={{
                background: `linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, hsl(${hsl.h}, 100%, 50%))`,
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const s = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                const l = Math.round(100 - ((e.clientY - rect.top) / rect.height) * 100);
                updateColor({ s: Math.max(0, Math.min(100, s)), l: Math.max(0, Math.min(100, l)) });
              }}
            >
              <motion.div
                className="absolute h-4 w-4 rounded-full border-2 border-white shadow-lg"
                style={{
                  left: `calc(${hsl.s}% - 8px)`,
                  top: `calc(${100 - hsl.l}% - 8px)`,
                  backgroundColor: currentHex,
                }}
              />
            </div>

            {/* Hue slider */}
            <div
              className="relative h-4 rounded-lg cursor-pointer"
              style={{
                background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const h = Math.round(((e.clientX - rect.left) / rect.width) * 360);
                updateColor({ h: Math.max(0, Math.min(360, h)) });
              }}
            >
              <motion.div
                className="absolute top-0 h-4 w-2 rounded bg-white shadow-lg border"
                style={{ left: `calc(${(hsl.h / 360) * 100}% - 4px)` }}
              />
            </div>

            {/* Opacity slider */}
            {showOpacity && (
              <div className="space-y-1">
                <Label className="text-xs">Opacidade: {opacity}%</Label>
                <Slider
                  value={[opacity]}
                  onValueChange={([v]) => setOpacity(v)}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="sliders" className="space-y-3">
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-xs">Matiz (H): {hsl.h}°</Label>
                <Slider
                  value={[hsl.h]}
                  onValueChange={([v]) => updateColor({ h: v })}
                  min={0}
                  max={360}
                  step={1}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Saturação (S): {hsl.s}%</Label>
                <Slider
                  value={[hsl.s]}
                  onValueChange={([v]) => updateColor({ s: v })}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Luminosidade (L): {hsl.l}%</Label>
                <Slider
                  value={[hsl.l]}
                  onValueChange={([v]) => updateColor({ l: v })}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Input and actions */}
        {showInput && (
          <div className="flex items-center gap-2 mt-3">
            <div
              className="h-8 w-8 rounded border shrink-0"
              style={{ backgroundColor: currentHex }}
            />
            <Input
              value={inputValue}
              onChange={handleInputChange}
              className="h-8 text-xs font-mono"
              placeholder="#000000"
            />
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={copyColor}>
              <Copy className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={randomColor}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Presets */}
        {showPresets && presets.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <Label className="text-xs text-muted-foreground mb-2 block">Cores predefinidas</Label>
            <div className="grid grid-cols-10 gap-1">
              {presets.map((color, index) => (
                <motion.button
                  key={index}
                  type="button"
                  className={cn(
                    'h-5 w-5 rounded-sm border transition-all hover:scale-110',
                    currentHex.toLowerCase() === color.toLowerCase() && 'ring-2 ring-primary ring-offset-1'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handlePresetClick(color)}
                  whileTap={{ scale: 0.9 }}
                >
                  {currentHex.toLowerCase() === color.toLowerCase() && (
                    <Check className="h-3 w-3 text-white mx-auto" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

// Color Swatch
interface ColorSwatchProps {
  colors: string[];
  value?: string;
  onChange?: (color: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  colors,
  value,
  onChange,
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {colors.map((color, index) => (
        <motion.button
          key={index}
          type="button"
          className={cn(
            sizes[size],
            'rounded-lg border-2 transition-all hover:scale-110',
            value === color ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'
          )}
          style={{ backgroundColor: color }}
          onClick={() => onChange?.(color)}
          whileTap={{ scale: 0.9 }}
        >
          {value === color && <Check className="h-4 w-4 text-white mx-auto" />}
        </motion.button>
      ))}
    </div>
  );
};

// Gradient Picker
interface GradientPickerProps {
  value?: string;
  onChange?: (gradient: string) => void;
  presets?: string[];
  className?: string;
}

const defaultGradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
  'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
];

export const GradientPicker: React.FC<GradientPickerProps> = ({
  value,
  onChange,
  presets = defaultGradients,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm">Gradientes</Label>
      <div className="grid grid-cols-4 gap-2">
        {presets.map((gradient, index) => (
          <motion.button
            key={index}
            type="button"
            className={cn(
              'h-12 rounded-lg border-2 transition-all hover:scale-105',
              value === gradient ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'
            )}
            style={{ background: gradient }}
            onClick={() => onChange?.(gradient)}
            whileTap={{ scale: 0.95 }}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
