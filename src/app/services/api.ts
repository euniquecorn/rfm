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

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api';

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
}
