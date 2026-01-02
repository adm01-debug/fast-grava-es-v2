interface EnvConfig {
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  
  // Bitrix24
  BITRIX_WEBHOOK_URL: string;
  
  // External Services
  RESEND_API_KEY?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_NUMBER?: string;
  TWILIO_WHATSAPP_NUMBER?: string;
  
  // App
  APP_ENV: 'development' | 'staging' | 'production';
  APP_DEBUG: boolean;
}

function getEnvVar(key: string, required = true): string {
  const value = import.meta.env[`VITE_${key}`] || import.meta.env[key] || '';
  if (required && !value) {
    console.warn(`Missing environment variable: ${key}`);
  }
  return value;
}

export const env: EnvConfig = {
  SUPABASE_URL: getEnvVar('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY'),
  BITRIX_WEBHOOK_URL: getEnvVar('BITRIX_WEBHOOK_URL') || 'https://promobrindes.bitrix24.com.br/rest/1/ipkwbb32nhewia33',
  RESEND_API_KEY: getEnvVar('RESEND_API_KEY', false),
  TWILIO_ACCOUNT_SID: getEnvVar('TWILIO_ACCOUNT_SID', false),
  TWILIO_AUTH_TOKEN: getEnvVar('TWILIO_AUTH_TOKEN', false),
  TWILIO_PHONE_NUMBER: getEnvVar('TWILIO_PHONE_NUMBER', false),
  TWILIO_WHATSAPP_NUMBER: getEnvVar('TWILIO_WHATSAPP_NUMBER', false),
  APP_ENV: (getEnvVar('APP_ENV', false) || 'development') as 'development' | 'staging' | 'production',
  APP_DEBUG: getEnvVar('APP_DEBUG', false) === 'true',
};

export const isProduction = env.APP_ENV === 'production';
export const isDevelopment = env.APP_ENV === 'development';
export const isStaging = env.APP_ENV === 'staging';

export function validateEnv(): { valid: boolean; missing: string[] } {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missing = required.filter(key => !env[key as keyof EnvConfig]);
  return { valid: missing.length === 0, missing };
}
