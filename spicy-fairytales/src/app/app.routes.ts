/**
 * @fileoverview Defines the main application routes.
 *
 * ## Architecture Context
 * This file contains the routing configuration for the application, mapping URL
 * paths to specific page components. It uses Angular's `Routes` array to define
 * the navigation structure.
 *
 * ## Information Flow
 * 1. The base application configuration (`app.config.ts`) imports this `routes`
 *    array.
 * 2. The Angular `Router` is provided with these routes, enabling navigation
 *    between different pages (e.g., the `GeneratePage`).
 *
 * ## Contract Compliance
 * - The `routes` array adheres to the `Routes` contract from `@angular/router`.
 * - It correctly maps the root path to the `GeneratePage`, which is the main
 *   entry point of the application's UI.
 */

import { Routes } from '@angular/router';
import { GeneratePageComponent } from './pages/generate.page';

export const routes: Routes = [
	{ path: '', redirectTo: 'generate', pathMatch: 'full' },
	{ path: 'generate', component: GeneratePageComponent },
];
