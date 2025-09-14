/**
 * Runtime environment configuration managing service implementation selection and API behavior.
 * 
 * Central configuration hub controlling the application's mock-first development workflow.
 * Switches between mock services (for development) and real API services (for production)
 * based on environment settings, supporting cost-effective development and testing.
 * 
 * INPUT: Environment variables (VITE_USE_MOCKS), build-time configuration
 * OUTPUT: Runtime service selection flags, API endpoint configuration
 * DEPENDENCIES: Angular environment variable system, build-time configuration
 * INTEGRATIONS: Consumed by app.config.ts for service provider selection
 * ARCHITECTURE: Enables mock-first development workflow, reducing API costs during development
 * CONFIGURATION: useMocks flag controls service implementation binding in dependency injection
 */

// Helper function to safely get environment variables from multiple sources
function getEnv(key: string): string | undefined {
  // First try process.env (server-side or build-time)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  
  // Try window environment (runtime injection)
  if (typeof window !== 'undefined' && (window as any).env) {
    return (window as any).env[key];
  }
  
  // Try import.meta.env (Vite-style, if available)
  try {
    const meta = import.meta as any;
    return meta?.env?.[key];
  } catch {
    // Ignore import.meta errors in non-Vite environments
  }
  
  return undefined;
}

export const env = {
  // Toggle to use mock services instead of real API-backed services
  // Set to false to use real Grok and ElevenLabs APIs
  // Reads from VITE_USE_MOCKS environment variable, defaults to false for production
  useMocks: getEnv('VITE_USE_MOCKS') === 'true' || false,
  
  // API configuration
  grokApiKey: getEnv('VITE_GROK_API_KEY') || '',
  elevenLabsApiKey: getEnv('VITE_ELEVENLABS_API_KEY') || '',
}
