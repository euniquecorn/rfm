import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { ApparelComponent } from './components/apparel/apparel';
import { CustomizationComponent } from './components/customization/customization';
import { CartComponent } from './components/cart/cart';
import { LandingPageComponent } from './components/landing-page/landing-page';
import { SettingsComponent } from './components/settings/settings';
import { AccountSettingsComponent } from './components/account-settings/account-settings';
import { LogoutComponent } from './components/logout/logout';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'apparel', component: ApparelComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'customization', component: CustomizationComponent },
  { path: 'cart', component: CartComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'account-settings', component: AccountSettingsComponent },
  { path: 'logout', component: LogoutComponent },
  { path: '**', redirectTo: '' } // Wildcard route for 404 page
];
