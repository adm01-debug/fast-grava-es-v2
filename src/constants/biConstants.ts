export const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  primaryGlow: 'hsl(var(--primary-glow))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  danger: 'hsl(var(--destructive))',
  purple: 'hsl(var(--accent-purple))',
  cyan: 'hsl(var(--accent-cyan))',
  pink: 'hsl(var(--accent-pink))',
  muted: 'hsl(var(--muted-foreground))',
  xp: 'hsl(var(--xp))',
  coins: 'hsl(var(--coins))',
  streak: 'hsl(var(--streak))',
};


export const GRADIENTS = {
  primary: 'from-primary/20 via-primary/5 to-transparent',
  success: 'from-success/20 via-success/5 to-transparent',
  warning: 'from-warning/20 via-warning/5 to-transparent',
  danger: 'from-destructive/20 via-destructive/5 to-transparent',
  purple: 'from-accent-purple/20 via-accent-purple/5 to-transparent',
};

export const PIE_COLORS = [
  'hsl(var(--success))',
  'hsl(var(--primary))',
  'hsl(var(--warning))',
  'hsl(var(--accent-purple))',
  'hsl(var(--accent-cyan))',
  'hsl(var(--accent-pink))',
];

export const getStudioName = (technique: string = '') => {
  const t = technique.toLowerCase();
  if (t.includes('laser')) return 'Studio Alfa';
  if (t.includes('uv') || t.includes('print')) return 'Studio Beta';
  return 'Studio Gamma';
};

export const STUDIO_LIST = ['Studio Alfa', 'Studio Beta', 'Studio Gamma'];

export const STUDIO_MAP: Record<string, string[]> = {
  'Studio Alfa': ['laser-co2', 'laser-fiber'],
  'Studio Beta': ['uv-print', 'sublimation'],
  'Studio Gamma': ['pad-printing', 'silkscreen', 'embroidery']
};
