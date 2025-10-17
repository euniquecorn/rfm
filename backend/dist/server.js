"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
exports.startServer = startServer;
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const database_1 = require("./config/database");
const canvas_routes_1 = __importDefault(require("./routes/canvas.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const database_service_1 = require("./services/database.service");
const app = express();
exports.app = app;
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.get('/api/health', async (req, res) => {
    try {
        const dbHealth = await database_service_1.DatabaseService.healthCheck();
        res.json({
            status: 'OK',
            message: 'Backend server is running',
            timestamp: new Date().toISOString(),
            database: dbHealth
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Backend server health check failed',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/canvas', canvas_routes_1.default);
app.use('/api/users', users_routes_1.default);
app.get('/', (req, res) => {
    res.json({
        message: 'RFM Backend API Server',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                logout: 'POST /api/auth/logout',
                me: 'GET /api/auth/me'
            },
            canvas: {
                save: 'POST /api/canvas/save',
                list: 'GET /api/canvas/list',
                get: 'GET /api/canvas/:id',
                update: 'PUT /api/canvas/:id',
                delete: 'DELETE /api/canvas/:id'
            },
            users: {
                list: 'GET /api/users',
                get: 'GET /api/users/:id',
                create: 'POST /api/users',
                update: 'PUT /api/users/:id',
                delete: 'DELETE /api/users/:id',
                updateLogin: 'PATCH /api/users/:id/login'
            }
        }
    });
});
app.use((err, req, res, next) => {
    console.error('Backend Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.originalUrl
    });
});
async function startServer() {
    try {
        const port = process.env['PORT'] || 3001;
        const isConnected = await (0, database_1.testConnection)();
        if (!isConnected) {
            console.error('❌ Failed to connect to database. Please check your XAMPP MySQL server.');
            process.exit(1);
        }
        await (0, database_1.initializeDatabase)();
        app.listen(port, () => {
            console.log(`🚀 RFM Backend API server listening on http://localhost:${port}`);
            console.log(`📊 Database: Connected to rfm_db`);
            console.log(`🎨 Canvas API: Ready for operations`);
            console.log(`📋 API Documentation: http://localhost:${port}`);
        });
        process.on('SIGINT', async () => {
            console.log('\n🛑 Shutting down backend server...');
            await (0, database_1.closeDatabase)();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            console.log('\n🛑 Shutting down backend server...');
            await (0, database_1.closeDatabase)();
            process.exit(0);
        });
    }
    catch (error) {
        console.error('❌ Failed to start backend server:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    startServer();
}
//# sourceMappingURL=server.js.map