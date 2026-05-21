import { useState, useEffect, useCallback } from 'react';
import { Joyride, Step, STATUS } from 'react-joyride';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth';
import { useTheme } from 'next-themes';

const STORAGE_KEY = 'onboarding_completed_v1';

/**
 * Marca o onboarding como concluído (usado para "Pular" e "Finalizar").
 */
export const markOnboardingCompleted = () => {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    /* ignore */
  }
};

/**
 * Reinicia o tour de onboarding, removendo a flag e disparando um evento global.
 * Pode ser chamado em qualquer lugar (ex: botão "Refazer tour" nas configurações).
 */
export const restartOnboarding = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('onboarding:restart'));
};

export const SystemOnboarding = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [run, setRun] = useState(false);

  // Primeiro acesso: só roda se a flag não estiver setada
  useEffect(() => {
    if (!user) return;
    const completed = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true';
    if (completed) return;
    const timer = setTimeout(() => setRun(true), 2000);
    return () => clearTimeout(timer);
  }, [user]);

  // Listener para reiniciar o tour manualmente
  useEffect(() => {
    const handler = () => setRun(true);
    window.addEventListener('onboarding:restart', handler);
    return () => window.removeEventListener('onboarding:restart', handler);
  }, []);

  const steps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      title: t('onboarding.welcome.title', { defaultValue: 'Bem-vindo ao FAST GRAVAÇÕES!' }),
      content: t('onboarding.welcome.content', {
        defaultValue:
          'Vamos fazer um tour rápido para você conhecer as principais funcionalidades da sua nova Fábrica Autônoma.',
      }),
    },
    {
      target: '#navigation',
      placement: 'right',
      title: t('onboarding.navigation.title', { defaultValue: 'Menu Principal' }),
      content: t('onboarding.navigation.content', {
        defaultValue: 'Aqui você acessa todos os módulos do sistema: Produção, Inventário, OEE e muito mais.',
      }),
    },
    {
      target: 'main h1',
      placement: 'bottom',
      title: t('onboarding.dashboard.title', { defaultValue: 'Dashboard' }),
      content: t('onboarding.dashboard.content', {
        defaultValue: 'Nesta área você visualiza os principais indicadores de performance em tempo real.',
      }),
    },
    {
      target: '[role="toolbar"]',
      placement: 'bottom',
      title: t('onboarding.toolbar.title', { defaultValue: 'Ações Rápidas' }),
      content: t('onboarding.toolbar.content', {
        defaultValue: 'Atalhos para favoritos, status de rede, notificações e troca de tema.',
      }),
    },
    {
      target: '#main-navigation button:first-of-type',
      placement: 'right',
      title: t('onboarding.newJob.title', { defaultValue: 'Agendamentos' }),
      content: t('onboarding.newJob.content', {
        defaultValue: 'Crie novos jobs e agende produções diretamente por aqui.',
      }),
    },
  ];

  const handleJoyrideCallback = useCallback((data: any) => {
    const { status } = data;
    const finished: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finished.includes(status)) {
      markOnboardingCompleted();
      setRun(false);
    }
  }, []);

  return (
    <Joyride
      run={run}
      steps={steps}
      continuous
      showProgress
      showSkipButton
      disableOverlayClose
      hideCloseButton={false}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          backgroundColor: theme === 'dark' ? 'hsl(var(--card))' : '#ffffff',
          textColor: theme === 'dark' ? 'hsl(var(--foreground))' : '#1f2937',
          arrowColor: theme === 'dark' ? 'hsl(var(--card))' : '#ffffff',
          zIndex: 10000,
        },
        tooltip: {
          textAlign: 'left',
          borderRadius: '12px',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: 13,
        },
      } as any}
      locale={{
        back: t('common.back', { defaultValue: 'Voltar' }),
        close: t('common.close', { defaultValue: 'Fechar' }),
        last: t('common.finish', { defaultValue: 'Finalizar' }),
        next: t('common.next', { defaultValue: 'Próximo' }),
        skip: t('common.skip', { defaultValue: 'Pular tour' }),
      }}
    />
  );
};
