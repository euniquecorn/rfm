import { Routes } from '@angular/router';
import { AccountSettingsComponent } from './components/account-settings/account-settings';
import { ApparelComponent } from './components/apparel/apparel';
import { CartComponent } from './components/cart/cart';
import { CheckoutComponent } from './components/checkout/checkout';
import { CustomizationComponent } from './components/customization/customization';
import { LandingPageComponent } from './components/landing-page/landing-page';
import { LoginComponent } from './components/login/login';
import { OrderHistoryComponent } from './components/order-history/order-history';
import { ProductDetailsComponent } from './components/product-details/product-details';
import { SignupComponent } from './components/signup/signup';

// Admin Components
import { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout';
import { AdminCustomizableProductsComponent } from './components/admin/customizable-products/customizable-products';
import { AdminEmployeesComponent } from './components/admin/employees/employees';
import { AdminOrdersComponent } from './components/admin/orders/orders';
import { AdminProductsComponent } from './components/admin/products/products';
import { AdminReportsComponent } from './components/admin/reports/reports';

// --- NEW IMPORTS (Corrected Naming) ---
import { CashflowComponent } from './components/admin/cashflow/cashflow'; // Corrected import name
// ---------------------------------------

// Guards
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';

import { PaymentVerificationComponent } from './components/admin/payment-verification/payment-verification';

export const routes: Routes = [
  { path: '', redirectTo: '/catalog', pathMatch: 'full' },
  { path: 'landing', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent, canActivate: [GuestGuard] },

  // Customer routes (optional auth)
  { path: 'catalog', component: ApparelComponent },
  { path: 'apparel', component: ApparelComponent },
  { path: 'product/:id', component: ProductDetailsComponent },
  { path: 'designing', component: CustomizationComponent },
  { path: 'canvas', component: CustomizationComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'orders', component: OrderHistoryComponent, canActivate: [AuthGuard] },


  // Protected user profile route
  {
    path: 'account-settings',
    component: AccountSettingsComponent,
    canActivate: [AuthGuard]
  },

  // Admin Routes (protected with auth + admin guards)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: '', redirectTo: 'payment-verification', pathMatch: 'full' },
      { path: 'payment-verification', component: PaymentVerificationComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'customizable-products', component: AdminCustomizableProductsComponent },
      { path: 'employees', component: AdminEmployeesComponent },

      // --- CORRECTED CASHFLOW ROUTE (Used CashflowComponent) ---
      { path: 'cashflow', component: CashflowComponent },
      // ---------------------------------------------------------

      { path: 'reports', component: AdminReportsComponent },

    ]
  },

  { path: '**', redirectTo: '' } // Wildcard route for 404 page
];