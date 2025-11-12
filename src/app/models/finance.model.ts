// src/app/models/finance.model.ts

export interface CashFlowReport {
    totalCashIn: number;
    totalCashOut: number;
    netFlow: number;
}

export interface CashFlowEntry {
    transactionId: string | number;
    date: Date; // Note: Date objects in TS are often returned as strings from HTTP requests
    type: 'IN' | 'OUT';
    description: string;
    amount: number;
    sourceTable: 'orders' | 'expenses';
}