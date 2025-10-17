// backend/index.js
const express = require('express');
<<<<<<< HEAD
=======
const cors = require('cors');
>>>>>>> signup-dev
const pool = require('./db');
const app = express();
const PORT = process.env.PORT || 3001;

<<<<<<< HEAD
=======
// Enable CORS for Angular frontend (allow any localhost port)
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow all localhost origins
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

>>>>>>> signup-dev
// Middleware to parse JSON request bodies
app.use(express.json());

// Test DB connection
app.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT NOW() AS now');
        res.send(`DB Connected! Server time: ${rows[0].now}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database connection failed');
    }
});

// ===== USERS CRUD =====

// GET all users
<<<<<<< HEAD
app.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Users');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch users' });
=======
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Users');
        
        // Transform database rows to match frontend interface
        const users = rows.map(row => {
            const nameParts = row.FullName ? row.FullName.split(' ') : ['', ''];
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            return {
                id: row.UserId,
                firstName: firstName,
                lastName: lastName,
                email: row.Email,
                phone: row.Phone,
                roles: row.Roles ? row.Roles.split(',').map(r => r.trim()) : [],
                status: row.Status || 'Active',
                hiredDate: row.hired_date,
                lastLogin: row.last_login,
                created_at: row.created_at,
                updated_at: row.updated_at
            };
        });
        
        res.json({
            success: true,
            data: users,
            message: 'Users retrieved successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users',
            message: err.message
        });
>>>>>>> signup-dev
    }
});

// GET single user by id
<<<<<<< HEAD
app.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM Users WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user' });
=======
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM Users WHERE UserId = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        const row = rows[0];
        const nameParts = row.FullName ? row.FullName.split(' ') : ['', ''];
        const user = {
            id: row.UserId,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: row.Email,
            phone: row.Phone,
            roles: row.Roles ? row.Roles.split(',').map(r => r.trim()) : [],
            status: row.Status || 'Active',
            hiredDate: row.hired_date,
            lastLogin: row.last_login,
            created_at: row.created_at,
            updated_at: row.updated_at
        };
        
        res.json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user',
            message: err.message
        });
>>>>>>> signup-dev
    }
});

// POST create new user
<<<<<<< HEAD
app.post('/users', async (req, res) => {
=======
app.post('/api/users', async (req, res) => {
>>>>>>> signup-dev
    try {
        const { username, email, password } = req.body; // adjust columns as per your table
        const [result] = await pool.query(
            'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password]
        );
        res.status(201).json({ id: result.insertId, username, email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// PUT update user
<<<<<<< HEAD
app.put('/users/:id', async (req, res) => {
=======
app.put('/api/users/:id', async (req, res) => {
>>>>>>> signup-dev
    try {
        const { id } = req.params;
        const { username, email, password } = req.body;
        const [result] = await pool.query(
            'UPDATE Users SET username = ?, email = ?, password = ? WHERE id = ?',
            [username, email, password, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ id, username, email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE user
<<<<<<< HEAD
app.delete('/users/:id', async (req, res) => {
=======
app.delete('/api/users/:id', async (req, res) => {
>>>>>>> signup-dev
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM Users WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
