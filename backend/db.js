// db.js
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load .env and override existing env vars
require('dotenv').config({ override: true });

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, // should now pick rfm_db
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        ca: fs.readFileSync(path.join(__dirname, 'certs', 'ca.pem'))
    }
});

// Test connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log(`✅ Connected to MySQL database: ${process.env.DB_NAME}`);
        connection.release();
    } catch (err) {
        console.error('❌ MySQL connection error:', err);
    }
}

testConnection();

module.exports = pool;
