import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DeviceInfo {
  fingerprint: string;
  browserName: string;
  osName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  userAgent: string;
}

// Gera um fingerprint simples baseado nas características do navegador
const generateFingerprint = (): string => {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.platform || 'unknown',
  ];
  
  const str = components.join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
};

// Detecta o navegador
const detectBrowser = (): string => {
  const ua = navigator.userAgent;
  
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  
  return 'Outro';
};

// Detecta o sistema operacional
const detectOS = (): string => {
  const ua = navigator.userAgent;
  
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  
  return 'Outro';
};

// Detecta o tipo de dispositivo
const detectDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
  const ua = navigator.userAgent;
  
  if (/iPad|tablet/i.test(ua)) return 'tablet';
  if (/iPhone|Android.*Mobile|webOS|BlackBerry/i.test(ua)) return 'mobile';
  
  return 'desktop';
};

// Coleta informações do dispositivo
const getDeviceInfo = (): DeviceInfo => {
  return {
    fingerprint: generateFingerprint(),
    browserName: detectBrowser(),
    osName: detectOS(),
    deviceType: detectDeviceType(),
    userAgent: navigator.userAgent.substring(0, 500), // Limitar tamanho
  };
};

// Obtém o IP do usuário
const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || '0.0.0.0';
  } catch {
    console.warn('Could not fetch IP address');
    return '0.0.0.0';
  }
};

export const useDeviceDetection = () => {
  const checkDevice = useCallback(async (userId: string, userEmail: string, userName?: string) => {
    try {
      const deviceInfo = getDeviceInfo();
      const ipAddress = await getClientIP();

      if (import.meta.env.DEV) console.log('Checking device:', { userId, fingerprint: deviceInfo.fingerprint });

      const response = await supabase.functions.invoke('new-device-alert', {
        body: {
          user_id: userId,
          user_email: userEmail,
          user_name: userName,
          device_fingerprint: deviceInfo.fingerprint,
          ip_address: ipAddress,
          user_agent: deviceInfo.userAgent,
          browser_name: deviceInfo.browserName,
          os_name: deviceInfo.osName,
          device_type: deviceInfo.deviceType,
        },
      });

      if (response.error) {
        console.error('Error checking device:', response.error);
        return { isNewDevice: false, error: response.error };
      }

      return { 
        isNewDevice: response.data?.is_new_device || false,
        deviceId: response.data?.device_id,
        error: null 
      };
    } catch (error) {
      console.error('Error in device detection:', error);
      return { isNewDevice: false, error };
    }
  }, []);

  return { checkDevice, getDeviceInfo };
};
