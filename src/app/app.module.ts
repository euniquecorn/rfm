import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { ApparelComponent } from './components/apparel/apparel';
import { CustomizationComponent } from './components/customization/customization';
import { CartComponent } from './components/cart/cart';
import { SettingsComponent } from './components/settings/settings';
import { AccountSettingsComponent } from './components/account-settings/account-settings';
import { LogoutComponent } from './components/logout/logout';
import { LandingPageComponent } from './components/landing-page/landing-page';

// Define routes manually here if AppRoutingModule is not generated or if you prefer this approach.
// If you have an app-routing.module.ts, you would import and use that instead.
// For this example, let's assume we are defining routes directly here for simplicity or if app-routing.module.ts was not generated.
// If you generated app-routing.module.ts, ensure it's imported and used correctly.

// In a typical Angular CLI setup, routes are managed in app-routing.module.ts
// and imported into app.module.ts. Since we're directly creating files, let's
// simulate the routing setup.

const appRoutes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'apparel', component: ApparelComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'customization', component: CustomizationComponent },
  { path: 'cart', component: CartComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'account-settings', component: AccountSettingsComponent },
  { path: 'logout', component: LogoutComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    ApparelComponent,
    CustomizationComponent,
    CartComponent,
    SettingsComponent,
    AccountSettingsComponent,
    LogoutComponent,
    LandingPageComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes) // Configure routes here
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }