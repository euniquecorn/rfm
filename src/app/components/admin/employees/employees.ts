import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, UserData } from '../../../services/api';

@Component({
  selector: 'app-admin-employees',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employees.html',
  styleUrls: ['./employees.css']
})
export class AdminEmployeesComponent implements OnInit {
  employees: UserData[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.apiService.getUsers().subscribe({
      next: (response) => {
        console.log('API Response:', response);
        if (response.success && response.data) {
          this.employees = response.data;
          this.loading = false;
        } else {
          this.error = response.message || 'Failed to load employees';
          this.loading = false;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('API Error:', err);
        this.error = err.message || 'Failed to connect to server';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getFullName(employee: UserData): string {
    return `${employee.firstName} ${employee.lastName}`.toUpperCase();
  }

  formatDate(dateString: string | undefined | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  formatDateTime(dateString: string | undefined | null): string {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getRoleClass(role: string): string {
    const roleMap: { [key: string]: string } = {
      'Ripper': 'role-ripper',
      'Designer': 'role-designer',
      'Seamster': 'role-seamster',
      'Cutter': 'role-cutter',
      'HT Operator': 'role-ht-operator'
    };
    return roleMap[role] || 'role-default';
  }

  onEditEmployee(employee: UserData) {
    console.log('Edit employee:', employee);
    // TODO: Implement edit functionality
  }

  onInviteEmployee(employee: UserData) {
    console.log('Invite employee:', employee);
    // TODO: Implement invite functionality
  }
}