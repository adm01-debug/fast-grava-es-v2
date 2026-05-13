import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function BackToOverviewButton({ onNavigate }: { onNavigate: (tabId: string) => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onNavigate('overview')}
      className="gap-2 text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar ao Overview
    </Button>
  );
}

// Overview Section Component
interface OverviewSectionProps {
  onNavigate: (tabId: string) => void;
}

type ConfettiShape = 'circle' | 'square' | 'rectangle' | 'star';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  velocity: number;
  size: number;
  rotation: number;
  shape: ConfettiShape;
  duration: number;
}

const getConfettiShapeStyle = (shape: ConfettiShape, size: number, color: string): React.CSSProperties => {
  const trailShadow = `
    0 2px 4px ${color}80,
    0 4px 8px ${color}60,
    0 8px 12px ${color}40,
    0 12px 16px ${color}20
  `;

  switch (shape) {
    case 'circle':
      return {
        borderRadius: '50%',
        boxShadow: trailShadow,
      };
    case 'square':
      return {
        borderRadius: '2px',
        boxShadow: trailShadow,
      };
    case 'rectangle':
      return {
        width: size * 0.5,
        height: size * 1.5,
        borderRadius: '1px',
        boxShadow: trailShadow,
      };
    case 'star':
      return {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderLeft: `${size * 0.5}px solid transparent`,
        borderRight: `${size * 0.5}px solid transparent`,
        borderBottom: `${size}px solid currentColor`,
        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
        filter: `drop-shadow(0 4px 6px ${color}60)`,
      };
    default:
      return {};
  }
};

const confettiShapes: ConfettiShape[] = ['circle', 'square', 'rectangle', 'star'];
