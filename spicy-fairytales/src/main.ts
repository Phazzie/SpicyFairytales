/**
 * Browser application bootstrap entry point for client-side Angular application initialization.
 * 
 * Primary browser entry point that initializes the Angular application in the client browser
 * environment. Bootstraps the root component with the complete application configuration,
 * dependency injection container, and service providers.
 * 
 * INPUT: Application configuration, root component, browser environment
 * OUTPUT: Running Angular application in browser, initialized services, rendered UI
 * DEPENDENCIES: Angular platform-browser, application configuration, root component
 * INTEGRATIONS: Entry point for browser-based application, works with SSR hydration
 * ARCHITECTURE: Single-page application initialization, dependency injection bootstrap
 * ERROR HANDLING: Global error catching and logging for application startup failures
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
