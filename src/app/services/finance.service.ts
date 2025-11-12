import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CashFlowEntry, CashFlowReport } from '../models/finance.model';

@Injectable({ providedIn: 'root' })
export class FinanceService {

    // Assumes environment.apiBaseUrl is set to 'http://localhost:3001/api'
    private apiUrl = `${environment.api.baseUrl}/finance`;

    constructor(private http: HttpClient) { }

    getCashFlowReport(startDate: string, endDate: string): Observable<{ success: boolean, data: CashFlowReport, message?: string }> {
        return this.http.get<{ success: boolean, data: CashFlowReport, message?: string }>(
            `${this.apiUrl}/report?start=${startDate}&end=${endDate}`
        );
    }

    getCashFlowLedger(startDate: string, endDate: string): Observable<{ success: boolean, data: CashFlowEntry[] }> {
        return this.http.get<{ success: boolean, data: CashFlowEntry[] }>(
            `${this.apiUrl}/ledger?start=${startDate}&end=${endDate}`
        );
    }
}