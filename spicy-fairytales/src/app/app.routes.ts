/**
 * Primary application routing configuration defining navigation structure and lazy loading strategy.
 * 
 * Establishes the application's navigation architecture with route definitions, guards,
 * and component mappings. Currently focused on the story generation workflow with
 * extensibility for future features like user accounts, story library, and settings.
 * 
 * INPUT: Route path definitions, component mappings, navigation guards
 * OUTPUT: Angular Router configuration, navigation structure, route resolution
 * DEPENDENCIES: Angular Router, page components, route guards and resolvers
 * INTEGRATIONS: Consumed by app.config.ts, provides navigation for entire application
 * ARCHITECTURE: Single-page application with component-based routing, supports lazy loading
 * EXTENSIBILITY: Ready for additional routes (profile, library, settings, admin)
 */
import { Routes } from '@angular/router';
import { GeneratePageComponent } from './pages/generate.page';

export const routes: Routes = [
	{ path: '', redirectTo: 'generate', pathMatch: 'full' },
	{ path: 'generate', component: GeneratePageComponent },
];
