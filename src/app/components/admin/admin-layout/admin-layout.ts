import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css']
})
export class AdminLayoutComponent {
  currentPage = 'Dashboard';
  
  menuItems = [
    { name: 'Dashboard', icon: '📊', route: '/admin/dashboard' },
    { name: 'Orders', icon: '🛒', route: '/admin/orders' },
    { name: 'Products', icon: '📦', route: '/admin/products' },
    { name: 'Mock-ups', icon: '🎨', route: '/admin/mockups' },
    { name: 'Cash flow', icon: '💰', route: '/admin/cashflow' },
    { name: 'Reports', icon: '📈', route: '/admin/reports' }
  ];

  constructor(private router: Router) {}

  navigateTo(item: any) {
    this.currentPage = item.name;
    this.router.navigate([item.route]);
  }

  logout() {
    // Add logout logic here
    this.router.navigate(['/login']);
  }
}