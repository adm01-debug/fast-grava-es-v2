import * as React from 'react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAStatus {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

interface PWAActions {
  install: () => Promise<boolean>;
  update: () => void;
  checkForUpdates: () => void;
}

interface PWAContextValue extends PWAStatus, PWAActions {}

const PWAContext = React.createContext<PWAContextValue | undefined>(undefined);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(true);
  const [isUpdateAvailable, setIsUpdateAvailable] = React.useState(false);
  const [registration, setRegistration] = React.useState<ServiceWorkerRegistration | null>(null);

  // Check if app is installed
  React.useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    checkInstalled();

    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkInstalled);
    return () => {
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkInstalled);
    };
  }, []);

  // Listen for install prompt
  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      toast.success('App instalado com sucesso!', {
        description: 'Você pode acessar o app pela sua tela inicial.',
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Online/offline detection
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexão restaurada', {
        description: 'Você está online novamente.',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Sem conexão', {
        description: 'Você está offline. Algumas funcionalidades podem estar limitadas.',
      });
    };

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Service worker updates
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setIsUpdateAvailable(true);
                toast.info('Atualização disponível', {
                  description: 'Uma nova versão está disponível.',
                  action: {
                    label: 'Atualizar',
                    onClick: () => window.location.reload(),
                  },
                });
              }
            });
          }
        });
      });

      // Listen for controller change
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const install = React.useCallback(async (): Promise<boolean> => {
    if (!installPrompt) {
      toast.error('Instalação não disponível', {
        description: 'Tente novamente mais tarde ou use o menu do navegador.',
      });
      return false;
    }

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setInstallPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Install error:', error);
      return false;
    }
  }, [installPrompt]);

  const update = React.useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [registration]);

  const checkForUpdates = React.useCallback(() => {
    if (registration) {
      registration.update().then(() => {
        toast.info('Verificando atualizações...');
      });
    }
  }, [registration]);

  const value: PWAContextValue = {
    isInstalled,
    isInstallable: !!installPrompt,
    isOnline,
    isUpdateAvailable,
    installPrompt,
    install,
    update,
    checkForUpdates,
  };

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
}

export function usePWA() {
  const context = React.useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider');
  }
  return context;
}

// PWA Install Banner Component
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PWAInstallBannerProps {
  className?: string;
  position?: 'top' | 'bottom';
}

export function PWAInstallBanner({ className, position = 'bottom' }: PWAInstallBannerProps) {
  const { isInstallable, isInstalled, install } = usePWA();
  const [dismissed, setDismissed] = React.useState(() => {
    return localStorage.getItem('pwa-banner-dismissed') === 'true';
  });

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setDismissed(true);
    }
  };

  if (!isInstallable || isInstalled || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: position === 'bottom' ? 100 : -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: position === 'bottom' ? 100 : -100 }}
        className={cn(
          "fixed left-0 right-0 z-50 p-4",
          position === 'bottom' ? 'bottom-0' : 'top-0',
          className
        )}
      >
        <div className="max-w-md mx-auto bg-card border rounded-lg shadow-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Smartphone className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Instalar App</h3>
              <p className="text-sm text-muted-foreground">
                Adicione à sua tela inicial para acesso rápido e offline.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleDismiss}
            >
              Agora não
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={handleInstall}
            >
              <Download className="h-4 w-4 mr-2" />
              Instalar
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Offline indicator
export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-warning text-warning-foreground py-2 px-4 text-center text-sm font-medium"
    >
      📡 Você está offline. Algumas funcionalidades podem estar limitadas.
    </motion.div>
  );
}
