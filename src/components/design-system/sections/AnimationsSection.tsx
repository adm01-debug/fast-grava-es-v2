import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { EntryAnimations } from './animations/EntryAnimations';
import { StaggerAnimations } from './animations/StaggerAnimations';
import { HoverEffects } from './animations/HoverEffects';
import { GlowEffects } from './animations/GlowEffects';
import { GamificationAnimations } from './animations/GamificationAnimations';
import { PulseGlowAnimation } from './animations/PulseGlowAnimation';

export function AnimationsSection() {
  const [animationKey, setAnimationKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setAnimationKey(prev => prev + 1)} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Replay Animações
        </Button>
      </div>

      <EntryAnimations animationKey={animationKey} />
      <StaggerAnimations animationKey={animationKey} />
      <HoverEffects />
      <GlowEffects />
      <GamificationAnimations animationKey={animationKey} />
      <PulseGlowAnimation />
    </div>
  );
}
