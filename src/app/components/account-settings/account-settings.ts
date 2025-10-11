import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, AuthUser } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-settings',
  imports: [CommonModule],
  templateUrl: './account-settings.html',
  styleUrl: './account-settings.css'
})
export class AccountSettingsComponent implements OnInit {
  user: AuthUser | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    protected authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    
    if (!this.user) {
      // If no user, redirect to login
      this.router.navigate(['/login']);
      return;
    }

    // Redirect customers to apparel page (they don't have profile page access)
    if (this.user.role === 'customer') {
      this.router.navigate(['/apparel']);
      return;
    }

    // For employees, redirect to admin panel (they use modal for profile)
    if (this.user.role === 'employee') {
      this.router.navigate(['/admin']);
      return;
    }
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getCurrentUserProfile().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.user) {
          this.user = response.user;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load profile';
        console.error('Error loading profile:', error);
      }
    });
  }

  isCustomer(): boolean {
    return this.user?.role === 'customer';
  }

  isEmployee(): boolean {
    return this.user?.role === 'employee';
  }
}
