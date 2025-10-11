import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AdminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();

  // Check if user is an employee (admin role)
  if (user && user.role === 'employee') {
    return true;
  }

  // Redirect customers to apparel page
  if (user && user.role === 'customer') {
    router.navigate(['/apparel']);
    return false;
  }

  // Redirect non-authenticated users to login
  router.navigate(['/login']);
  return false;
};

