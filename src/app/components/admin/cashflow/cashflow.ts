import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CashFlowEntry, CashFlowReport } from '../../../models/finance.model';
import { FinanceService } from '../../../services/finance.service';

@Component({
  selector: 'app-cashflow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cashflow.html',
  styleUrls: ['./cashflow.css'],
  providers: [DatePipe]
})
export class CashflowComponent implements OnInit {

  reportData: CashFlowReport | null = null;
  ledgerData: CashFlowEntry[] = [];

  startDate: string = '';
  endDate: string = '';

  isLoading: boolean = true;
  error: string | null = null;

  // Quick Range Toggle
  showQuickRange: boolean = false;

  constructor(
    private financeService: FinanceService,
    private datePipe: DatePipe
  ) {

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.endDate = this.datePipe.transform(today, 'yyyy-MM-dd') || '';
    this.startDate = this.datePipe.transform(thirtyDaysAgo, 'yyyy-MM-dd') || '';
  }

  ngOnInit(): void {
    this.fetchCashFlow();
  }

  // Date Range Display
  get dateRangeDisplay(): string {
    const start = this.datePipe.transform(this.startDate, 'MMM d, y');
    const end = this.datePipe.transform(this.endDate, 'MMM d, y');

    if (start && end) return `${start} - ${end}`;
    return 'Select Date Range';
  }

  // Fetch API Data
  fetchCashFlow(): void {
    this.isLoading = true;
    this.error = null;
    this.reportData = null;
    this.ledgerData = [];

    // Summary
    this.financeService.getCashFlowReport(this.startDate, this.endDate).subscribe({
      next: (res) => {
        if (res.success) {
          this.reportData = res.data;
        } else {
          this.error = res.message ?? 'Unknown API error during report fetch.';
        }
      },
      error: (err) => {
        console.error('Cash Flow Report Error:', err);
        this.error = 'Failed to load summary report.';
        this.isLoading = false;
      }
    });

    // Ledger
    this.financeService.getCashFlowLedger(this.startDate, this.endDate).subscribe({
      next: (res) => {
        if (res.success) this.ledgerData = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Cash Flow Ledger Error:', err);
        this.isLoading = false;
      }
    });
  }

  // ------------------------------
  // DATE PICKERS
  // ------------------------------

  triggerDateRange() {
    const startInput = document.querySelector('#start-date-ref') as HTMLInputElement;
    startInput?.showPicker();
  }

  openEndDate() {
    const endInput = document.querySelector('#end-date-ref') as HTMLInputElement;
    endInput?.showPicker();
  }

  // ------------------------------
  // QUICK RANGE MENU
  // ------------------------------

  toggleQuickRange() {
    this.showQuickRange = !this.showQuickRange;
  }

  setQuickRange(type: string) {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (type) {
      case 'today':
        start = end = today;
        break;

      case 'yesterday':
        start = new Date(today);
        start.setDate(today.getDate() - 1);
        end = start;
        break;

      case 'last7':
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        break;

      case 'last30':
        start = new Date(today);
        start.setDate(today.getDate() - 30);
        break;

      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = today;
        break;

      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
    }

    // Update values
    this.startDate = this.datePipe.transform(start, 'yyyy-MM-dd')!;
    this.endDate = this.datePipe.transform(end, 'yyyy-MM-dd')!;

    // Close menu + refresh
    this.showQuickRange = false;
    this.fetchCashFlow();
  }
}
