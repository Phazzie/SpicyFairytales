/**
 * Runtime environment configuration managing service implementation selection and API behavior.
 * 
 * Central configuration hub controlling the application's mock-first development workflow.
 * Switches between mock services (for development) and real API services (for production)
 * based on environment settings, supporting cost-effective development and testing.
 * 
 * INPUT: Environment variables (VITE_USE_MOCKS), build-time configuration
 * OUTPUT: Runtime service selection flags, API endpoint configuration
 * DEPENDENCIES: Vite environment variable system, build-time configuration
 * INTEGRATIONS: Consumed by app.config.ts for service provider selection
 * ARCHITECTURE: Enables mock-first development workflow, reducing API costs during development
 * CONFIGURATION: useMocks flag controls service implementation binding in dependency injection
 */
export const env = {
  // Toggle to use mock services instead of real API-backed services
  // Set to false to use real Grok and ElevenLabs APIs
  useMocks: (import.meta as any).env?.VITE_USE_MOCKS === 'true' || false,
}
