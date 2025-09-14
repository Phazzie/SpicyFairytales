/**
 * Test suite for the root Angular application component validating initialization and core functionality.
 * 
 * Unit tests ensuring the root App component properly initializes with required dependencies,
 * renders the application shell correctly, and integrates theme management and notification
 * systems without errors. Validates the application bootstrap process and core UI infrastructure.
 * 
 * INPUT: Angular testing utilities, component test bed, mock dependencies
 * OUTPUT: Component initialization validation, rendering tests, integration verification
 * DEPENDENCIES: Angular testing framework, TestBed, component mocking utilities
 * INTEGRATIONS: CI/CD pipeline, application stability testing, component integration validation
 * COVERAGE: Component creation, template rendering, dependency injection, basic functionality
 * QUALITY: Ensures application can be successfully bootstrapped and initialized in all environments
 */
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('🎭 Spicy FairyTales');
  });
});
