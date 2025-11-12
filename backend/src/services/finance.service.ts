// src/services/finance.service.ts

import { RowDataPacket } from 'mysql2/promise';
import pool from '../../db'; // Imports your successful Aiven connection pool

// Define the structure of the aggregated report
export interface CashFlowReport {
    totalCashIn: number;
    totalCashOut: number;
    netFlow: number;
}

// Define the structure of a single transaction entry
export interface CashFlowEntry {
    transactionId: string | number;
    date: Date;
    type: 'IN' | 'OUT';
    description: string;
    amount: number;
    sourceTable: 'orders' | 'expenses';
}

interface DateRange {
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
}

// 1. Fetch Aggregated Report (The Summary Metrics)
export async function getCashFlowReport(range: DateRange): Promise<CashFlowReport> {

    // NOTE: We only count orders that have a final status (Paid/Completed)
    const [rows] = await pool.query<RowDataPacket[]>(`
        -- Cash In (Orders)
        SELECT 
            'IN' as type, 
            SUM(total_amount) as total 
        FROM orders
        WHERE 
            status IN ('PAID', 'COMPLETED') AND created_at BETWEEN ? AND ?
        
        UNION ALL
        
        -- Cash Out (Expenses)
        SELECT 
            'OUT' as type, 
            SUM(amount) as total 
        FROM expenses
        WHERE 
            date BETWEEN ? AND ?
    `, [range.startDate, range.endDate, range.startDate, range.endDate]);

    const cashInRow = rows.find(r => r.type === 'IN');
    const cashOutRow = rows.find(r => r.type === 'OUT');

    const totalCashIn = parseFloat(cashInRow?.total || 0);
    const totalCashOut = parseFloat(cashOutRow?.total || 0);

    return {
        totalCashIn,
        totalCashOut,
        netFlow: totalCashIn - totalCashOut,
    };
}

// 2. Fetch Detailed Records (The Ledger for the report)
export async function getDetailedCashFlow(range: DateRange): Promise<CashFlowEntry[]> {

    // This query merges individual order and expense transactions into one stream
    const [rows] = await pool.query<RowDataPacket[]>(`
        (
            SELECT 
                CAST(orderId AS CHAR) AS transactionId, 
                created_at AS date, 
                'IN' AS type, 
                CONCAT('Sale: Order #', orderId) AS description, 
                total_amount AS amount,
                'orders' AS sourceTable
            FROM orders
            WHERE status IN ('PAID', 'COMPLETED') AND created_at BETWEEN ? AND ?
        )
        UNION ALL
        (
            SELECT 
                CAST(expenseId AS CHAR) AS transactionId, 
                date, 
                'OUT' AS type, 
                CONCAT(description, ' (', category, ')') AS description, 
                amount,
                'expenses' AS sourceTable
            FROM expenses
            WHERE date BETWEEN ? AND ?
        )
        ORDER BY date DESC
    `, [range.startDate, range.endDate, range.startDate, range.endDate]);

    // Map the generic results to the specific TypeScript interface
    return rows as CashFlowEntry[];
}