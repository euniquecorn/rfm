const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function checkTable() {
  try {
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
      } else {
        dbConfig.ssl = {
          rejectUnauthorized: false
        };
      }
    }

    console.log('🔗 Connecting to database...');
    const connection = await mysql.createConnection(dbConfig);
    
    // Show tables
    console.log('📋 Available tables:');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(tables);
    
    // Describe Users table structure
    console.log('\n📋 Users table structure:');
    const [columns] = await connection.execute('DESCRIBE Users');
    console.log(columns);
    
    // Show sample data
    console.log('\n📋 Sample data from Users:');
    const [rows] = await connection.execute('SELECT * FROM Users LIMIT 2');
    console.log(rows);
    
    await connection.end();
    console.log('✅ Done');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTable();