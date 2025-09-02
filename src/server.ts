import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { join } from 'node:path';
import { closeDatabase, initializeDatabase, testConnection } from './config/database';
import { DatabaseService } from './services/database.service';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Middleware setup
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await DatabaseService.healthCheck();
    res.json({
      status: 'OK',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      database: dbHealth
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Server health check failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Canvas/Fabric.js related endpoints
app.post('/api/canvas/save', async (req, res) => {
  try {
    const { canvasData, name } = req.body;
    
    if (!canvasData) {
      return res.status(400).json({
        success: false,
        message: 'Canvas data is required'
      });
    }
    
    const result = await DatabaseService.saveCanvas(canvasData, name || 'Untitled Canvas');
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save canvas',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/canvas/list', async (req, res) => {
  try {
    const result = await DatabaseService.getCanvasList();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch canvas list',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/canvas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid canvas ID is required'
      });
    }
    
    const result = await DatabaseService.getCanvas(id);
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch canvas',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Additional canvas endpoints
app.put('/api/canvas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { canvasData, name } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid canvas ID is required'
      });
    }
    
    if (!canvasData) {
      return res.status(400).json({
        success: false,
        message: 'Canvas data is required'
      });
    }
    
    const result = await DatabaseService.updateCanvas(id, canvasData, name);
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update canvas',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.delete('/api/canvas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid canvas ID is required'
      });
    }
    
    const result = await DatabaseService.deleteCanvas(id);
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete canvas',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  
  // Initialize database and start server
  async function startServer() {
    try {
      // Test database connection
      const isConnected = await testConnection();
      if (!isConnected) {
        console.error('❌ Failed to connect to database. Please check your XAMPP MySQL server.');
        process.exit(1);
      }
      
      // Initialize database tables
      await initializeDatabase();
      
      // Start the server
      app.listen(port, (error) => {
        if (error) {
          throw error;
        }
        console.log(`🚀 Node Express server listening on http://localhost:${port}`);
        console.log(`📊 Database: Connected to rfm_db`);
        console.log(`🎨 Canvas API: Ready for Fabric.js operations`);
      });
      
      // Graceful shutdown
      process.on('SIGINT', async () => {
        console.log('\n🛑 Shutting down server...');
        await closeDatabase();
        process.exit(0);
      });
      
      process.on('SIGTERM', async () => {
        console.log('\n🛑 Shutting down server...');
        await closeDatabase();
        process.exit(0);
      });
      
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
  
  startServer();
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
