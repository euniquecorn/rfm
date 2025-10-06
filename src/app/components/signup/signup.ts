import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) { }

  onSubmit() {
    // Clear previous messages
    this.successMessage = '';
    this.errorMessage = '';

    // Validate passwords
    if (this.password !== this.confirmPassword) {
      this.errorMessage = "Passwords do not match!";
      return;
    }

    // Validate required fields manually (optional if using template-driven validation)
    if (!this.username || !this.email || !this.password) {
      this.errorMessage = "All fields are required!";
      return;
    }

    // Prepare the data to send
    const userData = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    // Make POST request to backend
    this.http.post('http://localhost:3001/users', userData).subscribe({
      next: (res: any) => {
        this.successMessage = "Signup successful! Redirecting to login...";
        console.log('User created:', res);

        // Clear the form
        this.username = '';
        this.email = '';
        this.password = '';
        this.confirmPassword = '';

        // Redirect to login after 2 seconds
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        console.error('Signup error:', err);
        this.errorMessage = err.error?.error || "Signup failed. Please try again.";
      }
    });
  }
}
