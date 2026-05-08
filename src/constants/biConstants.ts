export const CHART_COLORS = {
  primary: '#0ea5e9',
  primaryGlow: '#38bdf8',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  pink: '#ec4899',
};

export const GRADIENTS = {
  primary: 'from-primary/20 via-primary/5 to-transparent',
  success: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
  warning: 'from-amber-500/20 via-amber-500/5 to-transparent',
  danger: 'from-rose-500/20 via-rose-500/5 to-transparent',
  purple: 'from-violet-500/20 via-violet-500/5 to-transparent',
};

export const PIE_COLORS = [
  '#10b981', // success
  '#0ea5e9', // primary
  '#f59e0b', // warning
  '#38bdf8', // primary glow
  '#8b5cf6', // purple
  '#06b6d4', // cyan
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
