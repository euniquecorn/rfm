import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, UserData } from '../../../services/api';

@Component({
  selector: 'app-admin-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.html',
  styleUrls: ['./employees.css']
})
export class AdminEmployeesComponent implements OnInit {
  employees: UserData[] = [];
  loading: boolean = true;
  error: string | null = null;
  editingEmployeeId: number | null = null;
  showAddForm: boolean = false;
  editForm: Partial<UserData> = {};
  newEmployeeForm: Partial<UserData> = this.getEmptyForm();
  availableRoles: string[] = ['Ripper', 'Designer', 'Seamster', 'Cutter', 'HT Operator'];

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
    const parts = [employee.firstName];
    if (employee.middleName) {
      parts.push(employee.middleName);
    }
    parts.push(employee.lastName);
    return parts.join(' ').toUpperCase();
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
    if (this.editingEmployeeId === employee.id) {
      // Cancel editing
      this.editingEmployeeId = null;
      this.editForm = {};
    } else {
      // Start editing
      this.editingEmployeeId = employee.id || null;
      this.editForm = {
        firstName: employee.firstName,
        middleName: employee.middleName || '',
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone || '',
        roles: [...employee.roles],
        status: employee.status
      };
      this.showAddForm = false; // Close add form if open
    }
    this.cdr.markForCheck();
  }

  saveEmployee(employee: UserData) {
    if (!employee.id) return;

    const updatedData: Partial<UserData> = {
      firstName: this.editForm.firstName,
      middleName: this.editForm.middleName,
      lastName: this.editForm.lastName,
      email: this.editForm.email,
      phone: this.editForm.phone,
      roles: this.editForm.roles,
      status: this.editForm.status
    };

    this.apiService.updateUser(employee.id.toString(), updatedData).subscribe({
      next: (response) => {
        if (response.success) {
          this.editingEmployeeId = null;
          this.editForm = {};
          this.loadEmployees();
        } else {
          alert('Failed to update employee: ' + (response.message || 'Unknown error'));
        }
      },
      error: (err) => {
        alert('Error updating employee: ' + (err.message || 'Unknown error'));
      }
    });
  }

  cancelEdit() {
    this.editingEmployeeId = null;
    this.editForm = {};
    this.cdr.markForCheck();
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.newEmployeeForm = this.getEmptyForm();
      this.editingEmployeeId = null; // Close any edit form
    }
    this.cdr.markForCheck();
  }

  addEmployee() {
    // Validate required fields
    if (!this.newEmployeeForm.firstName || !this.newEmployeeForm.lastName ||
        !this.newEmployeeForm.email || !this.newEmployeeForm.roles?.length) {
      alert('Please fill in all required fields (First Name, Last Name, Email, and at least one Role)');
      return;
    }

    const newEmployee: Omit<UserData, 'id' | 'created_at' | 'updated_at'> = {
      firstName: this.newEmployeeForm.firstName,
      middleName: this.newEmployeeForm.middleName,
      lastName: this.newEmployeeForm.lastName,
      email: this.newEmployeeForm.email,
      phone: this.newEmployeeForm.phone || '',
      roles: this.newEmployeeForm.roles || [],
      status: this.newEmployeeForm.status || 'Active'
    };

    this.apiService.createUser(newEmployee).subscribe({
      next: (response) => {
        if (response.success) {
          this.showAddForm = false;
          this.newEmployeeForm = this.getEmptyForm();
          this.loadEmployees();
        } else {
          alert('Failed to add employee: ' + (response.message || 'Unknown error'));
        }
      },
      error: (err) => {
        alert('Error adding employee: ' + (err.message || 'Unknown error'));
      }
    });
  }

  cancelAdd() {
    this.showAddForm = false;
    this.newEmployeeForm = this.getEmptyForm();
    this.cdr.markForCheck();
  }

  toggleRole(role: string, formType: 'edit' | 'add') {
    const form = formType === 'edit' ? this.editForm : this.newEmployeeForm;
    
    if (!form.roles) {
      form.roles = [];
    }

    const index = form.roles.indexOf(role);
    if (index > -1) {
      form.roles.splice(index, 1);
    } else {
      form.roles.push(role);
    }
    this.cdr.markForCheck();
  }

  isRoleSelected(role: string, formType: 'edit' | 'add'): boolean {
    const form = formType === 'edit' ? this.editForm : this.newEmployeeForm;
    return form.roles?.includes(role) || false;
  }

  private getEmptyForm(): Partial<UserData> {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      roles: [],
      status: 'Active'
    };
  }
}