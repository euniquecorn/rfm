// src/routes/finance.routes.ts

import { Request, Response, Router } from 'express';
import {
    CashFlowEntry,
    getCashFlowReport,
    getDetailedCashFlow
} from '../services/finance.service';
// NOTE: You should add an authentication middleware here to protect this sensitive route!
// import { verifyToken } from '../middleware/auth.middleware'; 

const router = Router();

// Middleware to validate the date range from query params and attach it to the request object
function validateDateRange(req: Request, res: Response, next: Function) {
    const startDate = req.query.start as string;
    const endDate = req.query.end as string;

    // Simple validation: ensure they are present and somewhat formatted like a date (YYYY-MM-DD)
    if (!startDate || !endDate || !/\d{4}-\d{2}-\d{2}/.test(startDate) || !/\d{4}-\d{2}-\d{2}/.test(endDate)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid date range. Please provide start and end dates in YYYY-MM-DD format.'
        });
    }

    // FIX: Attach to the request object directly (not req.body) for GET requests
    (req as any).dateRange = { startDate, endDate };
    next();
}


// Endpoint 1: GET /api/finance/report?start=...&end=...
// Returns the aggregated summary (Total Cash In/Out, Net Flow)
router.get('/report',
    // verifyToken, // <-- UNCOMMENT THIS LATER
    validateDateRange,
    async (req: Request, res: Response) => {
        try {
            // FIX: Read from the custom 'dateRange' property attached to req
            const report = await getCashFlowReport((req as any).dateRange);
            res.json({ success: true, data: report });
        } catch (error) {
            console.error('API Error: Failed to generate cash flow report:', error);
            // It's helpful to send the actual error message back during development
            res.status(500).json({
                success: false,
                message: 'Failed to generate cash flow report.',
                error: (error as Error).message // Sending the actual DB/Service error
            });
        }
    });


// Endpoint 2: GET /api/finance/ledger?start=...&end=...
// Returns the detailed, line-by-line list of transactions
router.get('/ledger',
    // verifyToken, // <-- UNCOMMENT THIS LATER
    validateDateRange,
    async (req: Request, res: Response) => {
        try {
            // FIX: Read from the custom 'dateRange' property attached to req
            const ledger: CashFlowEntry[] = await getDetailedCashFlow((req as any).dateRange);
            res.json({ success: true, data: ledger });
        } catch (error) {
            console.error('API Error: Failed to fetch cash flow ledger:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch cash flow ledger.',
                error: (error as Error).message // Sending the actual DB/Service error
            });
        }
    });

export default router;