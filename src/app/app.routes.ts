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

// Admin Components
import { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout';
import { AdminDashboardComponent } from './components/admin/dashboard/dashboard';
import { AdminOrdersComponent } from './components/admin/orders/orders';
import { AdminProductsComponent } from './components/admin/products/products';
import { AdminMockupsComponent } from './components/admin/mockups/mockups';
import { AdminCashflowComponent } from './components/admin/cashflow/cashflow';
import { AdminReportsComponent } from './components/admin/reports/reports';
import { AdminEmployeesComponent } from './components/admin/employees/employees';

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
  
  // Admin Routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'employees', component: AdminEmployeesComponent },
      { path: 'mockups', component: AdminMockupsComponent },
      { path: 'cashflow', component: AdminCashflowComponent },
      { path: 'reports', component: AdminReportsComponent }
    ]
  },
  
  { path: '**', redirectTo: '' } // Wildcard route for 404 page
];
