# Implement Authentication & Role-Based Access Control

**Status:** ✅ COMPLETED  
**Date:** October 9, 2025  
**Version:** 1.0

---

## 1. Database Schema

### ✅ Table already exists!
Use existing `customer_accounts` with these fields:
- `CustomerId` (PK, auto_increment)
- `CustomerFullName` (varchar 255, NOT NULL)
- `CustomerEmail` (varchar 255, UNIQUE, NOT NULL)
- `CustomerPhone` (varchar 20, UNIQUE, nullable)
- `CustomerPasswordHash` (char 60, NOT NULL) - bcrypt format
- `CustomerAddress` (text, nullable)
- `created_at` (timestamp, auto)
- `last_login` (timestamp, nullable)

**No database migration needed.**

---

## 2. Backend API - Authentication Endpoints

### ✅ Created `backend/src/routes/auth.routes.ts`

**Endpoints:**
- `POST /api/auth/register` - Create customer account with bcrypt hashed password
- `POST /api/auth/login` - Authenticate and return user type (customer/employee) + basic info
- `POST /api/auth/logout` - Clear session/token
- `GET /api/auth/me` - Get current user info

### ✅ Created `backend/src/services/auth.service.ts`

**Features:**
- ✅ Installed bcrypt: `npm install bcrypt @types/bcrypt` in backend/
- ✅ `hashPassword()` - Use bcrypt.hash() with salt rounds 10
- ✅ `comparePassword()` - Use bcrypt.compare() to verify
- ✅ `registerCustomer()` - Insert into customer_accounts using CustomerEmail, CustomerFullName, etc.
- ✅ `loginUser()` - Check both customer_accounts and Users tables:
  - First check customer_accounts by CustomerEmail
  - Then check Users table by Email
  - If found in Users table, parse Roles JSON and check if contains "admin"
  - Return role='employee' only if user has "admin" in Roles array
  - Return role='customer' for customer_accounts users
- ✅ `getCustomerProfile(id)` - Fetch customer data from customer_accounts
- ✅ `getEmployeeProfile(id)` - Fetch employee data from Users table
- ✅ Update last_login timestamp on successful login

### ✅ Updated `backend/src/server.ts`
- Import and mount auth routes: `app.use('/api/auth', authRoutes)`
- Updated API documentation endpoint

---

## 3. Frontend - Auth Service

### ✅ Created `src/app/services/auth.service.ts`

**Features:**
- Store current user state (email, name, role, id) using Angular signals
- `register()` - Call POST /api/auth/register
- `login()` - Call POST /api/auth/login, store user in localStorage
- `logout()` - Clear user state and localStorage
- `isAuthenticated()` - Check if user logged in
- `getUserRole()` - Return 'customer' or 'employee'
- `getCurrentUser()` - Get user info
- `isAdmin()` - Check if user is employee
- `isCustomer()` - Check if user is customer
- Auto-load user from localStorage on app startup

### ✅ Updated `src/app/services/api.ts`

Added auth-related interfaces:
```typescript
export interface CustomerAccount {
  id?: number;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  created_at?: string;
  last_login?: string | null;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'customer' | 'employee';
  phone?: string;
  address?: string;
  roles?: string[];
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  message?: string;
  error?: string;
}
```

---

## 4. Frontend - Login Component

### ✅ Updated `src/app/components/login/login.ts`
- Import FormsModule, ReactiveFormsModule, Router, AuthService
- Create reactive form with email & password validators
- `onSubmit()`:
  - Call authService.login()
  - If role='customer' → navigate to '/apparel'
  - If role='employee' → navigate to '/admin'
  - Show error messages on failure

### ✅ Updated `src/app/components/login/login.html`
- Bind form controls with formControlName
- Add error message display
- Fix "Create an Account" link to use routerLink="/signup"
- Show loading state during login

---

## 5. Frontend - Signup Component

### ✅ Updated `src/app/components/signup/signup.ts`
- Import FormsModule, ReactiveFormsModule, Router, AuthService
- Create reactive form: email, password, confirmPassword, fullName, phone, address
- Add validators (email format, password match, required fields)
- `onSubmit()`:
  - Validate password confirmation
  - Call authService.register()
  - Auto-login and redirect to /apparel on success

### ✅ Updated `src/app/components/signup/signup.html`
- Replace username with fullName
- Add phone and address fields
- Bind all form controls
- Show validation errors
- Display success message on registration

---

## 6. Route Guards

### ✅ Created `src/app/guards/auth.guard.ts`
- Implement `canActivate` guard
- Check if user is authenticated, redirect to /login if not

### ✅ Created `src/app/guards/admin.guard.ts`
- Check if user role is 'employee' with "admin" in roles
- Redirect to /apparel if customer tries to access admin
- Redirect to /login if not authenticated

### ✅ Updated `src/app/app.routes.ts`
- Add guards to admin routes: `canActivate: [AuthGuard, AdminGuard]`
- Add AuthGuard to /account-settings
- Remove /logout route (handled in dropdown)
- Remove /settings route (redundant)

---

## 7. UI Updates - Navigation & Profile

### ✅ Updated main navigation in `src/app/app.ts` and `src/app/app.html`

**When NOT authenticated:**
- Show: "Login" and "Sign Up" buttons

**When authenticated:**
- Show: User profile icon (person icon) with Bootstrap 5 dropdown
- Dropdown contains:
  - Display user name/email at top
  - "Admin Panel" → routes to /admin (employees only)
  - "Logout" → calls authService.logout(), redirects to home

**Removed from customer dropdown:**
- ❌ "My Profile" link (customers don't have profile page)

### ✅ Updated `src/app/components/account-settings/account-settings.ts`
- Redirect customers to /apparel (no profile page access)
- Redirect employees to /admin (use modal for profile)
- Removed API call that was causing infinite loading

---

## 8. Admin Panel - Profile Dropdown & Modal

### ✅ Updated `src/app/components/admin/admin-layout/admin-layout.ts`
- Import AuthService
- Add `openProfileModal()` - Opens Bootstrap 5 modal
- Add `goToCustomerPanel()` - Navigate to /apparel
- Add `logout()` - Call authService.logout()

### ✅ Updated `src/app/components/admin/admin-layout/admin-layout.html`

**Bootstrap 5 Dropdown Menu:**
- User name & email header
- 👤 **My Profile** - Opens modal with profile info
- 🛍️ **Customer Panel** - Navigate to customer-facing pages
- 🚪 **Logout** - Sign out (red text)

**Bootstrap 5 Profile Modal:**
- Displays employee information:
  - Full Name
  - Email
  - Phone
  - Roles (badges)
  - Account Type badge
- Modal stays in admin context (no page navigation)

### ✅ Updated `src/app/components/admin/admin-layout/admin-layout.css`
- Removed custom dropdown styles
- Use Bootstrap 5 native dropdown styling
- Added modal styling

---

## Files Created

**Backend:**
- `backend/src/routes/auth.routes.ts`
- `backend/src/services/auth.service.ts`

**Frontend:**
- `src/app/services/auth.service.ts`
- `src/app/guards/auth.guard.ts`
- `src/app/guards/admin.guard.ts`

---

## Files Modified

**Backend:**
- `backend/src/server.ts` - Mount auth routes
- `backend/package.json` - Added bcrypt dependency

**Frontend:**
- `src/app/services/api.ts` - Added auth interfaces
- `src/app/app.ts` - Added AuthService injection and logout method
- `src/app/app.html` - Updated navigation with auth dropdown
- `src/app/components/login/login.ts` - Login logic with role-based routing
- `src/app/components/login/login.html` - Login form with validation
- `src/app/components/signup/signup.ts` - Signup logic with customer fields
- `src/app/components/signup/signup.html` - Signup form with address field
- `src/app/components/account-settings/account-settings.ts` - Redirect logic
- `src/app/components/admin/admin-layout/admin-layout.ts` - Profile modal & dropdown
- `src/app/components/admin/admin-layout/admin-layout.html` - Bootstrap dropdown & modal
- `src/app/components/admin/admin-layout/admin-layout.css` - Updated styling
- `src/app/app.routes.ts` - Added route guards

---

## Security Features

✅ Bcrypt password hashing (salt rounds: 10)  
✅ Password minimum length validation (6 characters)  
✅ Email format validation  
✅ Role-based access control  
✅ Route guards preventing unauthorized access  
✅ Duplicate email prevention  
✅ Admin role verification for employee access  
✅ LocalStorage persistence with auto-load on startup  

---

## User Access Flow

### Customer Registration & Login
1. User registers at `/signup`
2. Data saved to `customer_accounts` table
3. Password hashed with bcrypt
4. Auto-login after registration
5. Redirected to `/apparel` (customer panel)
6. Access: Apparel, Customize, Cart
7. Logout via dropdown in navigation

### Employee/Admin Login
1. Admin logs in at `/login`
2. System checks `Users` table
3. Verifies "admin" exists in Roles JSON
4. Redirected to `/admin` (admin panel)
5. Access: Full admin panel + can switch to customer panel
6. Profile info accessible via modal (dropdown)
7. Can navigate between Admin and Customer panels

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register customer
- `POST /api/auth/login` - Login (dual table check)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user profile

### Users (Employees)
- `GET /api/users` - Get all employees
- `GET /api/users/:id` - Get employee by ID
- `POST /api/users` - Create employee
- `PUT /api/users/:id` - Update employee
- `DELETE /api/users/:id` - Delete employee
- `PATCH /api/users/:id/login` - Update last login

### Canvas
- `POST /api/canvas/save` - Save canvas
- `GET /api/canvas/list` - List canvases
- `GET /api/canvas/:id` - Get canvas
- `PUT /api/canvas/:id` - Update canvas
- `DELETE /api/canvas/:id` - Delete canvas

---

## Testing Credentials

### Admin Account
```
Email: admin@rfm.com
Password: admin123
Role: Employee with "admin" role
```

### Customer Account
Register new account at: http://localhost:4200/signup

---

## Known Behaviors

1. ✅ `/account-settings` page redirects customers to `/apparel`
2. ✅ `/account-settings` page redirects employees to `/admin`
3. ✅ Customers have simple dropdown: Email + Logout
4. ✅ Employees have full dropdown: Profile Modal + Panel Switcher + Logout
5. ✅ Profile info shown in modal (admin panel only)
6. ✅ No separate profile page needed

---

## Future Enhancements (Not Implemented)

- Password reset functionality
- Email verification
- Remember me functionality
- Session timeout
- Edit profile functionality
- Password change
- Two-factor authentication

---

**Implementation Complete! ✅**

All authentication and role-based access control features are working as designed.

