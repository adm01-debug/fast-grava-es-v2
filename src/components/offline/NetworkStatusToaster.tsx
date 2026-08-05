import { useEffect } from 'react';
import { toast } from 'sonner';
import { Wifi, WifiOff } from 'lucide-react';

export function NetworkStatusToaster() {
  useEffect(() => {
    const handleOnline = () => {
      toast.success('Conexão restaurada', {
        id: 'network-status',
        description: 'Você está online novamente e as alterações serão sincronizadas.',
        icon: <Wifi className="h-4 w-4 text-green-500" />,
        duration: 4000,
      });
    };

    const handleOffline = () => {
      toast.error('Você está offline', {
        id: 'network-status',
        description: 'Algumas funcionalidades podem estar limitadas. Alterações serão salvas localmente.',
        icon: <WifiOff className="h-4 w-4 text-red-500" />,
        duration: Infinity,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return null;
}
