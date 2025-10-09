import express = require('express');
import cors = require('cors');
import bodyParser = require('body-parser');
import { closeDatabase, initializeDatabase, testConnection } from './config/database';
import canvasRoutes from './routes/canvas.routes';
import usersRoutes from './routes/users.routes';
import authRoutes from './routes/auth.routes';
import { DatabaseService } from './services/database.service';

const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', async (req: express.Request, res: express.Response) => {
  try {
    const dbHealth = await DatabaseService.healthCheck();
    res.json({ 
      status: 'OK', 
      message: 'Backend server is running', 
      timestamp: new Date().toISOString(),
      database: dbHealth
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Backend server health check failed', 
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/canvas', canvasRoutes);
app.use('/api/users', usersRoutes);

// Default route
app.get('/', (req: express.Request, res: express.Response) => {
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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Backend Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Start server function
async function startServer() {
  try {
    const port = process.env['PORT'] || 3001;
    
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Failed to connect to database. Please check your XAMPP MySQL server.');
      process.exit(1);
    }
    
    // Initialize database tables
    await initializeDatabase();
    
    // Start the server
    app.listen(port, () => {
      console.log(`🚀 RFM Backend API server listening on http://localhost:${port}`);
      console.log(`📊 Database: Connected to rfm_db`);
      console.log(`🎨 Canvas API: Ready for operations`);
      console.log(`📋 API Documentation: http://localhost:${port}`);
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down backend server...');
      await closeDatabase();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n🛑 Shutting down backend server...');
      await closeDatabase();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start backend server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

export { app, startServer };
