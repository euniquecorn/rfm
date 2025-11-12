import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CashFlowEntry, CashFlowReport } from '../../../models/finance.model';
import { FinanceService } from '../../../services/finance.service';

@Component({
  selector: 'app-cashflow',
  // Make the component standalone and import necessary modules
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cashflow.html',
  styleUrls: ['./cashflow.css'],
  providers: [DatePipe]
})
export class CashflowComponent implements OnInit {

  // Data to be displayed
  reportData: CashFlowReport | null = null;
  ledgerData: CashFlowEntry[] = [];

  // Date range variables
  startDate: string;
  endDate: string;

  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private financeService: FinanceService,
    private datePipe: DatePipe
  ) {
    // Initialize dates to a sensible default (e.g., last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Format dates to YYYY-MM-DD for the backend API
    this.endDate = this.datePipe.transform(today, 'yyyy-MM-dd') || '';
    this.startDate = this.datePipe.transform(thirtyDaysAgo, 'yyyy-MM-dd') || '';
  }

  ngOnInit(): void {
    this.fetchCashFlow();
  }

  /**
   * Getter function required by cashflow.html to display the selected date range.
   * This resolves the "Property 'dateRangeDisplay' does not exist" error.
   */
  get dateRangeDisplay(): string {
    // Format the start and end dates for user-friendly display (e.g., "Nov 12, 2025 - Dec 12, 2025")
    const start = this.datePipe.transform(this.startDate, 'MMM d, y');
    const end = this.datePipe.transform(this.endDate, 'MMM d, y');

    if (start && end) {
      return `${start} - ${end}`;
    }
    return 'Select Date Range'; // Fallback text
  }


  fetchCashFlow(): void {
    this.isLoading = true;
    this.error = null;
    this.reportData = null;
    this.ledgerData = [];

    // --- Fetch Aggregated Report ---
    this.financeService.getCashFlowReport(this.startDate, this.endDate).subscribe({
      next: (res) => {
        // Assuming success structure is consistent
        if (res.success) {
          this.reportData = res.data;
        } else {
          this.error = res.message || 'Unknown API error during report fetch.';
        }
      },
      error: (err) => {
        console.error('Failed to load Cash Flow Report:', err);
        this.error = 'Failed to load summary report.';
        this.isLoading = false;
      }
    });

    // --- Fetch Detailed Ledger ---
    this.financeService.getCashFlowLedger(this.startDate, this.endDate).subscribe({
      next: (res) => {
        if (res.success) {
          this.ledgerData = res.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load Cash Flow Ledger:', err);
        // Do not override report error unless necessary
        this.isLoading = false;
      }
    });
  }
}