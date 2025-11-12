// db.js
const mysql = require('mysql2/promise');
const fs = require('fs');
// NOTE: We don't need 'path' since we are using the absolute path from .env

// Load .env and override existing env vars
require('dotenv').config({ override: true });

// --- Database Configuration Start ---

// Determine SSL options based on the DB_SSL_CA environment variable
let sslOptions = {};
const sslCaPath = process.env.DB_SSL_CA;

if (sslCaPath) {
    try {
        sslOptions = {
            // Read the CA certificate content using the absolute path from .env
            ca: fs.readFileSync(sslCaPath)
        };
        console.log('ℹ️ SSL/TLS certificate loaded from .env');
    } catch (err) {
        console.error(`❌ ERROR: Could not read SSL certificate file at path: ${sslCaPath}`);
        console.error('     Please ensure the DB_SSL_CA path in your .env file is absolute and correct.');
        // If the certificate cannot be read, the program should not proceed
        process.exit(1);
    }
} else {
    // This is unlikely if you are using Aiven, but included for completeness
    console.log('⚠️ Warning: DB_SSL_CA environment variable is not set. Attempting insecure connection.');
}

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Inject the SSL options here
    ssl: sslOptions
});

// --- Database Configuration End ---


// Test connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log(`✅ Connected to MySQL database: ${process.env.DB_NAME}`);
        connection.release();
        return true;
    } catch (err) {
        console.error('❌ MySQL connection error:', err);
        return false;
    }
}

// Ensure the connection is tested upon module load
testConnection();

module.exports = pool;