import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

// NOTE: This NgModule is not currently used in this application.
// The app uses standalone components and is bootstrapped via bootstrapApplication() in main.ts
// This file is kept for reference or potential future migration back to NgModule approach.

// Routes are defined in app.routes.ts and used in app.config.ts
// This is a placeholder route configuration for NgModule compatibility
const appRoutes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
  { path: '**', redirectTo: '/landing' }
];

@NgModule({
  declarations: [
    // No components declared - this app uses standalone components
    // To use this module, components would need to remove standalone: true
    // and be declared here instead
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    // Providers are configured in app.config.ts for standalone components
  ],
  bootstrap: [
    // No bootstrap component - app uses bootstrapApplication() instead
    // To use this module, you would bootstrap a root component here
  ]
})
export class AppModule { 
  // This module is not used in the current standalone component architecture
  // To use this module, you would need to:
  // 1. Remove standalone: true from all components
  // 2. Declare all components in this module's declarations array
  // 3. Change main.ts to use platformBrowserDynamic().bootstrapModule(AppModule)
  // 4. Remove app.config.ts and move providers here
}