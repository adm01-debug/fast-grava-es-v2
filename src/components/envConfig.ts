/**
 * Environment Configuration Utilities
 * 
 * @module components/envConfig
 */

// Required environment variables
const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
];

export function validateEnv(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!import.meta.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;

export function getEnvVar(key: string, fallback?: string): string {
  const value = import.meta.env[key];
  if (!value && fallback === undefined) {
    console.warn(`Environment variable ${key} is not defined`);
  }
  return value || fallback || '';
}

export default {
  validateEnv,
  isProduction,
  isDevelopment,
  getEnvVar,
};
