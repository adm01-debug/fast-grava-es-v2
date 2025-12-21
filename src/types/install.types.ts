export interface InstallPrompt { platform: 'ios' | 'android' | 'desktop'; canInstall: boolean; }
export interface PWAStatus { isInstalled: boolean; isStandalone: boolean; }
