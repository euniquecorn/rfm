import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Apparel Store');
<<<<<<< HEAD
=======
  protected isAdminRoute = signal(false);

  constructor(
    private router: Router,
    protected authService: AuthService
  ) {
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Check if current route is an admin route
      this.isAdminRoute.set(event.url.startsWith('/admin'));
    });
  }

  logout(): void {
    this.authService.logout();
  }
>>>>>>> signup-dev
}