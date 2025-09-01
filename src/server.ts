import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Middleware setup
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

// Canvas/Fabric.js related endpoints
app.post('/api/canvas/save', (req, res) => {
  try {
    const { canvasData, name } = req.body;
    // Here you would typically save to a database
    // For now, we'll just return a success response
    res.json({
      success: true,
      message: 'Canvas saved successfully',
      id: Date.now().toString(),
      name: name || 'Untitled Canvas'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save canvas', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/canvas/list', (req, res) => {
  try {
    // Mock data - in a real app, this would come from a database
    const canvasList = [
      { id: '1', name: 'Sample Canvas 1', createdAt: new Date().toISOString() },
      { id: '2', name: 'Sample Canvas 2', createdAt: new Date().toISOString() }
    ];
    res.json({ success: true, data: canvasList });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch canvas list', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/canvas/:id', (req, res) => {
  try {
    const { id } = req.params;
    // Mock data - in a real app, this would come from a database
    const canvasData = {
      id,
      name: `Canvas ${id}`,
      data: { objects: [], background: '#ffffff' },
      createdAt: new Date().toISOString()
    };
    res.json({ success: true, data: canvasData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch canvas', error: error instanceof Error ? error.message : 'Unknown error' });
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
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
