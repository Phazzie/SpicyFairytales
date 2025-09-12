/**
 * Application routing configuration for navigation between pages.
 */
import { Routes } from '@angular/router';
import { GeneratePageComponent } from './pages/generate.page';

export const routes: Routes = [
	{ path: '', redirectTo: 'generate', pathMatch: 'full' },
	{ path: 'generate', component: GeneratePageComponent },
];
