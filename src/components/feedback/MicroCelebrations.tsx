import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Star, Sparkles, PartyPopper, ThumbsUp, Zap, Heart, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
type CelebrationType = 'confetti' | 'emoji' | 'badge' | 'sparkle' | 'success' | 'achievement';

interface Celebration {
  id: string;
  type: CelebrationType;
  message?: string;
  emoji?: string;
  icon?: React.ReactNode;
  position?: { x: number; y: number };
}

interface MicroCelebrationsContextType {
  celebrate: (type: CelebrationType, options?: Partial<Celebration>) => void;
  celebrateAtElement: (element: HTMLElement, type: CelebrationType, options?: Partial<Celebration>) => void;
}

const MicroCelebrationsContext = createContext<MicroCelebrationsContextType | null>(null);

// Confetti launcher
const launchConfetti = (options?: { origin?: { x: number; y: number } }) => {
  const defaults = {
    origin: options?.origin || { x: 0.5, y: 0.5 },
    spread: 60,
    ticks: 100,
    gravity: 1.2,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
  };

  confetti({
    ...defaults,
    particleCount: 40,
    scalar: 1.2,
  });

  confetti({
    ...defaults,
    particleCount: 20,
    scalar: 0.8,
  });
};

// Star burst effect
const launchStars = (origin: { x: number; y: number }) => {
  confetti({
    particleCount: 30,
    spread: 360,
    origin,
    shapes: ['star'],
    colors: ['#FFD700', '#FFA500', '#FFFF00'],
    scalar: 1.5,
    gravity: 0.8,
    ticks: 60,
  });
};

// Emoji rain
const EmojiRain: React.FC<{ emoji: string; count?: number }> = ({ emoji, count = 10 }) => {
  const emojis = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random(),
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
      {emojis.map(e => (
        <motion.div
          key={e.id}
          initial={{ y: -50, x: `${e.left}vw`, rotate: 0, opacity: 1 }}
          animate={{ y: '110vh', rotate: 360, opacity: 0 }}
          transition={{ duration: e.duration, delay: e.delay, ease: 'linear' }}
          className="absolute text-3xl"
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
};

// Floating badge
const FloatingBadge: React.FC<{
  icon: React.ReactNode;
  message: string;
  position?: { x: number; y: number };
}> = ({ icon, message, position = { x: 50, y: 50 } }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.5, opacity: 0, y: -50 }}
      transition={{ type: 'spring', damping: 15, stiffness: 300 }}
      className="fixed z-[9999] pointer-events-none"
      style={{ left: `${position.x}%`, top: `${position.y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <div className="flex flex-col items-center gap-2">
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg"
        >
          {icon}
        </motion.div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
        >
          {message}
        </motion.span>
      </div>
    </motion.div>
  );
};

// Sparkle burst
const SparkleBurst: React.FC<{ position?: { x: number; y: number } }> = ({ position = { x: 50, y: 50 } }) => {
  const sparkles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (360 / 12) * i,
    distance: 50 + Math.random() * 30,
    size: 10 + Math.random() * 10,
    delay: Math.random() * 0.2,
  }));

  return (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{ left: `${position.x}%`, top: `${position.y}%`, transform: 'translate(-50%, -50%)' }}
    >
      {sparkles.map(s => (
        <motion.div
          key={s.id}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [1, 1, 0],
            x: Math.cos((s.angle * Math.PI) / 180) * s.distance,
            y: Math.sin((s.angle * Math.PI) / 180) * s.distance,
          }}
          transition={{ duration: 0.6, delay: s.delay }}
          className="absolute"
        >
          <Sparkles className="text-yellow-400" style={{ width: s.size, height: s.size }} />
        </motion.div>
      ))}
    </div>
  );
};

// Success checkmark
const SuccessCheckmark: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: [0, 1.2, 1] }}
      exit={{ scale: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 bg-green-500"
      />
      <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-2xl">
        <motion.svg
          viewBox="0 0 24 24"
          className="w-12 h-12 text-white"
          initial="hidden"
          animate="visible"
        >
          <motion.path
            d="M20 6L9 17l-5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          />
        </motion.svg>
      </div>
    </motion.div>
  );
};

// Provider
export const MicroCelebrationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);

  const removeCelebration = useCallback((id: string) => {
    setCelebrations(prev => prev.filter(c => c.id !== id));
  }, []);

  const celebrate = useCallback((type: CelebrationType, options?: Partial<Celebration>) => {
    const id = `celebration-${Date.now()}-${Math.random()}`;
    const celebration: Celebration = { id, type, ...options };

    setCelebrations(prev => [...prev, celebration]);

    // Handle confetti separately
    if (type === 'confetti') {
      launchConfetti({ origin: options?.position });
    } else if (type === 'sparkle') {
      launchStars(options?.position || { x: 0.5, y: 0.5 });
    }

    // Auto-remove after animation
    setTimeout(() => removeCelebration(id), 3000);
  }, [removeCelebration]);

  const celebrateAtElement = useCallback((element: HTMLElement, type: CelebrationType, options?: Partial<Celebration>) => {
    const rect = element.getBoundingClientRect();
    const position = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };
    celebrate(type, { ...options, position });
  }, [celebrate]);

  return (
    <MicroCelebrationsContext.Provider value={{ celebrate, celebrateAtElement }}>
      {children}
      <AnimatePresence>
        {celebrations.map(c => (
          <React.Fragment key={c.id}>
            {c.type === 'emoji' && <EmojiRain emoji={c.emoji || '🎉'} />}
            {c.type === 'badge' && (
              <FloatingBadge
                icon={c.icon || <Trophy className="w-8 h-8 text-white" />}
                message={c.message || 'Parabéns!'}
                position={c.position ? { x: c.position.x * 100, y: c.position.y * 100 } : undefined}
              />
            )}
            {c.type === 'sparkle' && (
              <SparkleBurst
                position={c.position ? { x: c.position.x * 100, y: c.position.y * 100 } : undefined}
              />
            )}
            {c.type === 'success' && <SuccessCheckmark />}
            {c.type === 'achievement' && (
              <FloatingBadge
                icon={<Award className="w-8 h-8 text-white" />}
                message={c.message || 'Conquista Desbloqueada!'}
                position={c.position ? { x: c.position.x * 100, y: c.position.y * 100 } : undefined}
              />
            )}
          </React.Fragment>
        ))}
      </AnimatePresence>
    </MicroCelebrationsContext.Provider>
  );
};

// Hook
export function useCelebrate() {
  const context = useContext(MicroCelebrationsContext);
  if (!context) {
    throw new Error('useCelebrate must be used within MicroCelebrationsProvider');
  }
  return context;
}

// Celebration button wrapper
export const CelebrationButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    celebrationType?: CelebrationType;
    celebrationMessage?: string;
  }
> = ({ celebrationType = 'sparkle', celebrationMessage, onClick, children, ...props }) => {
  const { celebrateAtElement } = useCelebrate();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    celebrateAtElement(e.currentTarget, celebrationType, { message: celebrationMessage });
    onClick?.(e);
  };

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  );
};

// Preset celebrations
export const celebrations = {
  taskCompleted: () => ({ type: 'sparkle' as const, message: 'Tarefa Concluída!' }),
  goalReached: () => ({ type: 'confetti' as const }),
  newRecord: () => ({ type: 'achievement' as const, message: 'Novo Recorde!' }),
  levelUp: () => ({ type: 'emoji' as const, emoji: '⭐' }),
  firstJob: () => ({ type: 'badge' as const, message: 'Primeiro Job!' }),
  perfectQuality: () => ({ type: 'achievement' as const, message: 'Qualidade Perfeita!' }),
};
