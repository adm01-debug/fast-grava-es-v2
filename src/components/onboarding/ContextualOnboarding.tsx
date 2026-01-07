import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Lightbulb, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Types
interface OnboardingStep {
  id: string;
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
  tips?: string[];
}

interface OnboardingFlow {
  id: string;
  name: string;
  steps: OnboardingStep[];
  triggerCondition?: () => boolean;
}

interface ContextualOnboardingContextType {
  startFlow: (flowId: string) => void;
  endFlow: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipFlow: () => void;
  currentFlow: OnboardingFlow | null;
  currentStepIndex: number;
  isActive: boolean;
  completedFlows: string[];
  markFlowComplete: (flowId: string) => void;
  showTooltip: (target: string, content: string) => void;
  hideTooltip: () => void;
}

const ContextualOnboardingContext = createContext<ContextualOnboardingContextType | null>(null);

// Predefined flows for the application
const defaultFlows: OnboardingFlow[] = [
  {
    id: 'dashboard-intro',
    name: 'Introdução ao Dashboard',
    steps: [
      {
        id: 'welcome',
        target: '[data-onboarding="dashboard"]',
        title: '👋 Bem-vindo ao seu Dashboard!',
        description: 'Este é seu centro de comando. Aqui você tem uma visão geral de toda sua operação.',
        position: 'bottom',
        tips: ['Use os filtros para personalizar sua visualização', 'Clique nos cards para ver mais detalhes']
      },
      {
        id: 'kpis',
        target: '[data-onboarding="kpis"]',
        title: '📊 KPIs em Tempo Real',
        description: 'Monitore seus indicadores mais importantes. Cores indicam performance: verde = ótimo, amarelo = atenção, vermelho = crítico.',
        position: 'bottom'
      },
      {
        id: 'quick-actions',
        target: '[data-onboarding="quick-actions"]',
        title: '⚡ Ações Rápidas',
        description: 'Acesse as funções mais usadas com um clique. Você pode personalizar esta área.',
        position: 'left'
      }
    ]
  },
  {
    id: 'job-creation',
    name: 'Criando seu Primeiro Job',
    steps: [
      {
        id: 'new-job',
        target: '[data-onboarding="new-job"]',
        title: '➕ Criar Novo Job',
        description: 'Clique aqui para começar a criar um novo job de produção.',
        position: 'bottom'
      },
      {
        id: 'job-form',
        target: '[data-onboarding="job-form"]',
        title: '📝 Preencha os Detalhes',
        description: 'Adicione as informações do job. Campos com * são obrigatórios.',
        position: 'right',
        tips: ['Use templates para agilizar', 'O sistema salva automaticamente']
      }
    ]
  },
  {
    id: 'first-time-user',
    name: 'Primeiros Passos',
    steps: [
      {
        id: 'navigation',
        target: '[data-onboarding="sidebar"]',
        title: '🧭 Navegação Principal',
        description: 'Use o menu lateral para acessar todas as áreas do sistema.',
        position: 'right'
      },
      {
        id: 'search',
        target: '[data-onboarding="global-search"]',
        title: '🔍 Busca Global',
        description: 'Encontre qualquer coisa rapidamente. Use Ctrl+K para abrir.',
        position: 'bottom'
      },
      {
        id: 'notifications',
        target: '[data-onboarding="notifications"]',
        title: '🔔 Notificações',
        description: 'Fique por dentro de alertas e atualizações importantes.',
        position: 'bottom'
      },
      {
        id: 'profile',
        target: '[data-onboarding="profile"]',
        title: '👤 Seu Perfil',
        description: 'Configure suas preferências e personalize sua experiência.',
        position: 'left'
      }
    ]
  }
];

// Spotlight overlay component
const SpotlightOverlay: React.FC<{
  targetElement: Element | null;
  children: React.ReactNode;
}> = ({ targetElement, children }) => {
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!targetElement) return;

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      const padding = 8;
      setSpotlightStyle({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [targetElement]);

  return (
    <div className="fixed inset-0 z-[9998]">
      {/* Dark overlay with spotlight hole */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm">
        <div
          className="absolute bg-transparent rounded-lg ring-4 ring-primary ring-offset-2 ring-offset-transparent transition-all duration-300"
          style={{
            ...spotlightStyle,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
          }}
        />
      </div>
      {children}
    </div>
  );
};

// Tooltip component
const OnboardingTooltip: React.FC<{
  step: OnboardingStep;
  currentIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: () => void;
  targetElement: Element | null;
}> = ({ step, currentIndex, totalSteps, onNext, onPrev, onSkip, onComplete, targetElement }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const isLastStep = currentIndex === totalSteps - 1;
  const isFirstStep = currentIndex === 0;

  useEffect(() => {
    if (!targetElement) return;

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      const tooltipWidth = 360;
      const tooltipHeight = 250;
      const offset = 16;

      let top = 0;
      let left = 0;

      switch (step.position) {
        case 'top':
          top = rect.top - tooltipHeight - offset;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'bottom':
          top = rect.bottom + offset;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - offset;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + offset;
          break;
        default:
          top = rect.bottom + offset;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
      }

      // Keep within viewport
      top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));
      left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [targetElement, step.position]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed z-[9999] w-[360px]"
      style={{ top: position.top, left: position.left }}
    >
      <Card className="p-5 shadow-2xl border-primary/20 bg-card/95 backdrop-blur-md">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              Passo {currentIndex + 1} de {totalSteps}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mr-2 -mt-2"
            onClick={onSkip}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress */}
        <Progress value={((currentIndex + 1) / totalSteps) * 100} className="h-1 mb-4" />

        {/* Content */}
        <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

        {/* Tips */}
        {step.tips && step.tips.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-medium">Dicas</span>
            </div>
            <ul className="space-y-1">
              {step.tips.map((tip, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action button from step */}
        {step.action && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mb-4"
            onClick={step.action.onClick}
          >
            <Target className="w-4 h-4 mr-2" />
            {step.action.label}
          </Button>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrev}
            disabled={isFirstStep}
            className={cn(isFirstStep && 'invisible')}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>

          <Button
            size="sm"
            onClick={isLastStep ? onComplete : onNext}
            className="gap-1"
          >
            {isLastStep ? (
              <>
                Concluir
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

// Floating tooltip for contextual help
const FloatingTooltip: React.FC<{
  target: string;
  content: string;
  onClose: () => void;
}> = ({ target, content, onClose }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const targetElement = document.querySelector(target);

  useEffect(() => {
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2 - 150,
    });
  }, [targetElement]);

  if (!targetElement) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="fixed z-[9999] w-[300px]"
      style={{ top: position.top, left: position.left }}
    >
      <Card className="p-3 shadow-lg border-primary/20">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm">{content}</p>
          <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

// Provider component
export const ContextualOnboardingProvider: React.FC<{
  children: React.ReactNode;
  flows?: OnboardingFlow[];
}> = ({ children, flows = defaultFlows }) => {
  const [currentFlow, setCurrentFlow] = useState<OnboardingFlow | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedFlows, setCompletedFlows] = useState<string[]>(() => {
    const saved = localStorage.getItem('onboarding-completed-flows');
    return saved ? JSON.parse(saved) : [];
  });
  const [tooltip, setTooltip] = useState<{ target: string; content: string } | null>(null);
  const [targetElement, setTargetElement] = useState<Element | null>(null);

  const allFlows = [...defaultFlows, ...flows];

  useEffect(() => {
    localStorage.setItem('onboarding-completed-flows', JSON.stringify(completedFlows));
  }, [completedFlows]);

  useEffect(() => {
    if (!currentFlow) {
      setTargetElement(null);
      return;
    }

    const step = currentFlow.steps[currentStepIndex];
    const element = document.querySelector(step.target);
    setTargetElement(element);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentFlow, currentStepIndex]);

  const startFlow = useCallback((flowId: string) => {
    const flow = allFlows.find(f => f.id === flowId);
    if (flow && !completedFlows.includes(flowId)) {
      setCurrentFlow(flow);
      setCurrentStepIndex(0);
    }
  }, [allFlows, completedFlows]);

  const endFlow = useCallback(() => {
    setCurrentFlow(null);
    setCurrentStepIndex(0);
  }, []);

  const nextStep = useCallback(() => {
    if (currentFlow && currentStepIndex < currentFlow.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentFlow, currentStepIndex]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const skipFlow = useCallback(() => {
    if (currentFlow) {
      setCompletedFlows(prev => [...prev, currentFlow.id]);
    }
    endFlow();
  }, [currentFlow, endFlow]);

  const markFlowComplete = useCallback((flowId: string) => {
    setCompletedFlows(prev => {
      if (prev.includes(flowId)) return prev;
      return [...prev, flowId];
    });
    if (currentFlow?.id === flowId) {
      endFlow();
    }
  }, [currentFlow, endFlow]);

  const handleComplete = useCallback(() => {
    if (currentFlow) {
      markFlowComplete(currentFlow.id);
    }
  }, [currentFlow, markFlowComplete]);

  const showTooltip = useCallback((target: string, content: string) => {
    setTooltip({ target, content });
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltip(null);
  }, []);

  const currentStep = currentFlow?.steps[currentStepIndex];
  const isActive = !!currentFlow;

  return (
    <ContextualOnboardingContext.Provider
      value={{
        startFlow,
        endFlow,
        nextStep,
        prevStep,
        skipFlow,
        currentFlow,
        currentStepIndex,
        isActive,
        completedFlows,
        markFlowComplete,
        showTooltip,
        hideTooltip,
      }}
    >
      {children}

      <AnimatePresence>
        {isActive && currentStep && (
          <SpotlightOverlay targetElement={targetElement}>
            <OnboardingTooltip
              step={currentStep}
              currentIndex={currentStepIndex}
              totalSteps={currentFlow!.steps.length}
              onNext={nextStep}
              onPrev={prevStep}
              onSkip={skipFlow}
              onComplete={handleComplete}
              targetElement={targetElement}
            />
          </SpotlightOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {tooltip && (
          <FloatingTooltip
            target={tooltip.target}
            content={tooltip.content}
            onClose={hideTooltip}
          />
        )}
      </AnimatePresence>
    </ContextualOnboardingContext.Provider>
  );
};

// Hook to use onboarding
export function useContextualOnboarding() {
  const context = useContext(ContextualOnboardingContext);
  if (!context) {
    throw new Error('useContextualOnboarding must be used within ContextualOnboardingProvider');
  }
  return context;
}

// Component to trigger onboarding for first-time users
export const FirstTimeUserOnboarding: React.FC = () => {
  const { startFlow, completedFlows } = useContextualOnboarding();

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('has-seen-initial-onboarding');
    if (!hasSeenOnboarding && !completedFlows.includes('first-time-user')) {
      const timer = setTimeout(() => {
        startFlow('first-time-user');
        localStorage.setItem('has-seen-initial-onboarding', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [startFlow, completedFlows]);

  return null;
};

// Button to restart onboarding
export const RestartOnboardingButton: React.FC<{
  flowId?: string;
  className?: string;
}> = ({ flowId = 'first-time-user', className }) => {
  const { startFlow } = useContextualOnboarding();

  const handleClick = () => {
    localStorage.removeItem('has-seen-initial-onboarding');
    localStorage.removeItem('onboarding-completed-flows');
    startFlow(flowId);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick} className={className}>
      <Sparkles className="w-4 h-4 mr-2" />
      Ver Tour Novamente
    </Button>
  );
};
