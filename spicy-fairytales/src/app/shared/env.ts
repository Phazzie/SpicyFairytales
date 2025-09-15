/**
 * Environment configuration for Spicy FairyTales application.
 * 
 * Provides centralized access to environment variables with robust validation,
 * proper fallbacks, and comprehensive error handling. Handles development,
 * production, and testing scenarios with cross-platform compatibility.
 * 
 * CRITICAL: This is the single source of truth for all environment configuration.
 * Any service requiring API keys or configuration should use this module.
 */

/**
 * Environment variable validation and type definitions
 */
interface EnvironmentConfig {
  grokApiKey: string;
  elevenLabsApiKey: string;
  useMocks: boolean;
  isProduction: boolean;
  isDevelopment: boolean;
  apiTimeout: number;
  maxRetries: number;
  isConfigured(): boolean;
  getMissingKeys(): string[];
  validateApiKey(key: string, service: string): boolean;
  getApiKey(service: 'grok' | 'elevenlabs'): string | null;
}

/**
 * Cross-platform environment variable getter with multiple fallback strategies.
 * Includes validation and error handling for production environments.
 */
function getEnv(key: string): string | undefined {
  let value: string | undefined;
  
  // Strategy 1: Node.js process.env (SSR, testing, CI/CD)
  if (typeof process !== 'undefined' && process.env) {
    value = process.env[key];
    if (value) return value;
  }
  
  // Strategy 2: Vite import.meta.env (development builds)
  try {
    const meta = import.meta as any;
    value = meta?.env?.[key];
    if (value) return value;
  } catch {
    // import.meta not available in all environments
  }
  
  // Strategy 3: Browser window.env (injected by build tools)
  if (typeof window !== 'undefined' && (window as any).env) {
    value = (window as any).env[key];
    if (value) return value;
  }
  
  // Strategy 4: Local storage fallback (development override only)
  if (typeof localStorage !== 'undefined' && !isProductionEnvironment()) {
    const stored = localStorage.getItem(key);
    if (stored && stored !== 'undefined' && stored !== 'null') {
      return stored;
    }
  }
  
  return undefined;
}

/**
 * Detect if we're in a production environment
 */
function isProductionEnvironment(): boolean {
  return getEnv('NODE_ENV') === 'production' || 
         getEnv('VERCEL_ENV') === 'production' ||
         typeof process !== 'undefined' && process.env['NODE_ENV'] === 'production';
}

/**
 * Validate API key format and content
 */
function validateApiKeyFormat(key: string, service: string): boolean {
  if (!key || key.trim() === '') return false;
  
  // Check for placeholder values
  const placeholders = [
    'your_api_key_here',
    'your_grok_api_key_here', 
    'your_elevenlabs_api_key_here',
    'placeholder',
    'test',
    'demo'
  ];
  
  if (placeholders.includes(key.toLowerCase())) return false;
  
  // Service-specific validation
  switch (service) {
    case 'grok':
      // Grok API keys typically start with specific patterns
      return key.length > 20 && /^[a-zA-Z0-9._-]+$/.test(key);
    case 'elevenlabs':
      // ElevenLabs API keys have specific format
      return key.length > 20 && /^[a-fA-F0-9]+$/.test(key);
    default:
      return key.length > 10;
  }
}

/**
 * Environment configuration object with validated defaults and comprehensive validation.
 * All environment variables are accessed through this centralized, type-safe configuration.
 */
export const env: EnvironmentConfig = {
  // API Configuration with validation
  grokApiKey: getEnv('VITE_GROK_API_KEY') || '',
  elevenLabsApiKey: getEnv('VITE_ELEVENLABS_API_KEY') || '',
  
  // Application Configuration
  useMocks: getEnv('VITE_USE_MOCKS') === 'true',
  
  // Environment Detection
  isProduction: isProductionEnvironment(),
  isDevelopment: getEnv('NODE_ENV') === 'development',
  
  // Performance Configuration
  apiTimeout: parseInt(getEnv('VITE_API_TIMEOUT') || '30000', 10),
  maxRetries: parseInt(getEnv('VITE_MAX_RETRIES') || '3', 10),
  
  // Validation Methods
  isConfigured(): boolean {
    if (this.useMocks) return true;
    return this.validateApiKey(this.grokApiKey, 'grok') && 
           this.validateApiKey(this.elevenLabsApiKey, 'elevenlabs');
  },
  
  getMissingKeys(): string[] {
    if (this.useMocks) return [];
    
    const missing: string[] = [];
    if (!this.validateApiKey(this.grokApiKey, 'grok')) {
      missing.push('VITE_GROK_API_KEY');
    }
    if (!this.validateApiKey(this.elevenLabsApiKey, 'elevenlabs')) {
      missing.push('VITE_ELEVENLABS_API_KEY');
    }
    return missing;
  },
  
  validateApiKey(key: string, service: string): boolean {
    return validateApiKeyFormat(key, service);
  },
  
  getApiKey(service: 'grok' | 'elevenlabs'): string | null {
    const key = service === 'grok' ? this.grokApiKey : this.elevenLabsApiKey;
    return this.validateApiKey(key, service) ? key : null;
  }
};

/**
 * Runtime environment validation - throws descriptive errors in production
 */
export function validateEnvironment(): void {
  if (env.useMocks) {
    console.log('🎭 Running with mock services - no API keys required');
    return;
  }
  
  const missing = env.getMissingKeys();
  if (missing.length > 0) {
    const error = `❌ Missing or invalid API keys: ${missing.join(', ')}\n` +
                  `Please check your .env file and ensure all API keys are properly configured.`;
    
    if (env.isProduction) {
      throw new Error(error);
    } else {
      console.warn(error);
      console.log('💡 Tip: Set VITE_USE_MOCKS=true to use mock services for development');
    }
  }
}
