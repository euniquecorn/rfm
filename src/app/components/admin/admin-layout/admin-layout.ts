import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

// Declare Bootstrap for TypeScript
declare var bootstrap: any;

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css']
})
export class AdminLayoutComponent implements OnInit {
  currentPage = 'Dashboard';
  
  menuItems = [
    { name: 'Dashboard', icon: '📊', route: '/admin/dashboard' },
    { name: 'Orders', icon: '🛒', route: '/admin/orders' },
    { name: 'Products', icon: '📦', route: '/admin/products' },
    { name: 'Employees', icon: '👥', route: '/admin/employees' },
    { name: 'Mock-ups', icon: '🎨', route: '/admin/mockups' },
    { name: 'Cash flow', icon: '💰', route: '/admin/cashflow' },
    { name: 'Reports', icon: '📈', route: '/admin/reports' }
  ];

  constructor(
    private router: Router,
    protected authService: AuthService
  ) {}

  ngOnInit() {
    // Update page title based on current route
    const currentRoute = this.router.url;
    const activeItem = this.menuItems.find(item => currentRoute.includes(item.route));
    if (activeItem) {
      this.currentPage = activeItem.name;
    }
  }

  navigateTo(item: any) {
    this.currentPage = item.name;
    this.router.navigate([item.route]);
  }

  openProfileModal() {
    const modalElement = document.getElementById('profileModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  goToCustomerPanel() {
    // Navigate to customer-facing apparel page
    this.router.navigate(['/apparel']);
  }

  logout() {
    this.authService.logout();
  }
}