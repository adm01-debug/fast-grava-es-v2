import React, { useState, useEffect } from 'react';
import { Joyride, Step, STATUS } from 'react-joyride';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/features/auth';
import { useTheme } from 'next-themes';

export const SystemOnboarding = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [run, setRun] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage('onboarding_completed', false);

  useEffect(() => {
    if (user && !hasCompletedOnboarding) {
      const timer = setTimeout(() => {
        setRun(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, hasCompletedOnboarding]);

  const steps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      title: t('onboarding.welcome.title', { defaultValue: 'Bem-vindo ao FAST GRAVAÇÕES!' }),
      content: t('onboarding.welcome.content', { defaultValue: 'Vamos fazer um tour rápido para você conhecer as principais funcionalidades da sua nova Fábrica Autônoma.' }),
    },
    {
      target: '#navigation',
      placement: 'right',
      title: t('onboarding.navigation.title', { defaultValue: 'Menu Principal' }),
      content: t('onboarding.navigation.content', { defaultValue: 'Aqui você acessa todos os módulos do sistema: Produção, Inventário, OEE e muito mais.' }),
    },
    {
      target: 'main h1',
      placement: 'bottom',
      title: t('onboarding.dashboard.title', { defaultValue: 'Dashboard' }),
      content: t('onboarding.dashboard.content', { defaultValue: 'Nesta área você visualiza os principais indicadores de performance em tempo real.' }),
    },
    {
      target: '[role="toolbar"]',
      placement: 'bottom',
      title: t('onboarding.toolbar.title', { defaultValue: 'Ações Rápidas' }),
      content: t('onboarding.toolbar.content', { defaultValue: 'Atalhos para favoritos, status de rede, notificações e troca de tema.' }),
    },
    {
      target: '#main-navigation button:first-of-type',
      placement: 'right',
      title: t('onboarding.newJob.title', { defaultValue: 'Agendamentos' }),
      content: t('onboarding.newJob.content', { defaultValue: 'Crie novos jobs e agende produções diretamente por aqui.' }),
    },
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setHasCompletedOnboarding(true);
      setRun(false);
    }
  };

  return (
    <Joyride
      run={run}
      steps={steps}
      continuous
      onEvent={handleJoyrideCallback}
      options={{
        showProgress: true,
        showSkipButton: true,
        primaryColor: 'hsl(var(--primary))',
      } as any}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
          textColor: theme === 'dark' ? '#f3f4f6' : '#1f2937',
          arrowColor: theme === 'dark' ? '#1f2937' : '#fff',
          zIndex: 10000,
        },
        tooltip: {
          textAlign: 'left',
          borderRadius: '12px',
        },
      } as any}
      locale={{
        back: t('common.back'),
        close: t('common.close', { defaultValue: 'Fechar' }),
        last: t('common.finish', { defaultValue: 'Finalizar' }),
        next: t('common.next'),
        skip: t('common.skip', { defaultValue: 'Pular' }),
      }}
    />
  );
};
