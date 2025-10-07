import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CanvasData {
  id?: string;
  name: string;
  data: any;
  createdAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface UserData {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: string[];
  status: 'Active' | 'Inactive';
  hiredDate?: string;
  lastLogin?: string | null;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) { }

  // Health check
  healthCheck(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/health`);
  }

  // Canvas operations
  saveCanvas(canvasData: any, name: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/canvas/save`, {
      canvasData,
      name
    });
  }

  getCanvasList(): Observable<ApiResponse<CanvasData[]>> {
    return this.http.get<ApiResponse<CanvasData[]>>(`${this.baseUrl}/canvas/list`);
  }

  getCanvas(id: string): Observable<ApiResponse<CanvasData>> {
    return this.http.get<ApiResponse<CanvasData>>(`${this.baseUrl}/canvas/${id}`);
  }

  // User/Employee operations
  getUsers(role?: string, status?: string): Observable<ApiResponse<UserData[]>> {
    let params = '';
    if (role || status) {
      const queryParams = [];
      if (role) queryParams.push(`role=${encodeURIComponent(role)}`);
      if (status) queryParams.push(`status=${encodeURIComponent(status)}`);
      params = '?' + queryParams.join('&');
    }
    return this.http.get<ApiResponse<UserData[]>>(`${this.baseUrl}/users${params}`);
  }

  getUser(id: string): Observable<ApiResponse<UserData>> {
    return this.http.get<ApiResponse<UserData>>(`${this.baseUrl}/users/${id}`);
  }

  createUser(userData: Omit<UserData, 'id' | 'created_at' | 'updated_at'>): Observable<ApiResponse<UserData>> {
    return this.http.post<ApiResponse<UserData>>(`${this.baseUrl}/users`, userData);
  }

  updateUser(id: string, userData: Partial<Omit<UserData, 'id' | 'created_at' | 'updated_at'>>): Observable<ApiResponse<UserData>> {
    return this.http.put<ApiResponse<UserData>>(`${this.baseUrl}/users/${id}`, userData);
  }

  deleteUser(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/users/${id}`);
  }

  updateUserLastLogin(id: string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.baseUrl}/users/${id}/login`, {});
  }
}
