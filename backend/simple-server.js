const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();

// Middleware - Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '50mb' }));

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Add SSL for Aiven
if (process.env.DB_HOST?.includes('aivencloud.com')) {
  const certPath = path.join(__dirname, 'certs/ca.pem');
  if (fs.existsSync(certPath)) {
    dbConfig.ssl = {
      ca: fs.readFileSync(certPath),
      rejectUnauthorized: true
    };
    console.log('✅ SSL certificate loaded for Aiven connection');
  } else {
    dbConfig.ssl = {
      rejectUnauthorized: false
    };
    console.log('⚠️ Using SSL without local certificate for Aiven connection');
  }
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('SELECT 1');
    await connection.end();
    
    res.json({ 
      status: 'OK', 
      message: 'Backend server is running', 
      timestamp: new Date().toISOString(),
      database: { success: true, message: 'Database connection is healthy' }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Backend server health check failed', 
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Get all users/employees
app.get('/api/users', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const query = `
      SELECT UserId, FullName, Email, Phone, Roles, Status, hired_date, last_login, created_at
      FROM Users
      ORDER BY created_at DESC
    `;
    
    const [rows] = await connection.execute(query);
    await connection.end();
    
    const users = rows.map(row => {
      // Split FullName into firstName and lastName
      const nameParts = row.FullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Handle roles - could be string or JSON
      let roles = [];
      if (row.Roles) {
        try {
          roles = JSON.parse(row.Roles);
        } catch {
          // If not JSON, treat as single role string
          roles = [row.Roles];
        }
      }
      
      return {
        id: row.UserId,
        firstName: firstName,
        lastName: lastName,
        email: row.Email,
        phone: row.Phone,
        roles: roles,
        status: row.Status,
        hiredDate: row.hired_date,
        lastLogin: row.last_login,
        created_at: row.created_at
      };
    });
    
    res.json({
      success: true,
      data: users
    });
    
  } catch (error) {
    console.error('Database error in getUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Update user last login
app.patch('/api/users/:id/login', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid user ID is required' 
      });
    }
    
    const connection = await mysql.createConnection(dbConfig);
    
    const query = `UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE UserId = ?`;
    const [result] = await connection.execute(query, [id]);
    await connection.end();
    
    if (result.affectedRows > 0) {
      res.json({
        success: true,
        message: 'User last login updated successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
  } catch (error) {
    console.error('Database error in updateUserLastLogin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user last login',
      error: error.message
    });
  }
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'RFM Backend API Server (Simple)',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: 'GET /api/users',
      updateLogin: 'PATCH /api/users/:id/login'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Start server
const port = process.env.PORT || 3001;

async function startServer() {
  try {
    // Test database connection first
    console.log('🔗 Testing database connection...');
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('SELECT 1');
    await connection.end();
    console.log('✅ Database connected successfully');
    
    app.listen(port, () => {
      console.log(`🚀 RFM Simple Backend API server listening on http://localhost:${port}`);
      console.log(`📊 Database: Connected to ${dbConfig.database}`);
      console.log(`👥 Users API: Ready at /api/users`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();