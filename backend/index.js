// backend/index.js
const express = require('express');
const pool = require('./db');
const app = express();
const PORT = process.env.PORT || 3001;

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
app.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Users');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET single user by id
app.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM Users WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// POST create new user
app.post('/users', async (req, res) => {
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
app.put('/users/:id', async (req, res) => {
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
app.delete('/users/:id', async (req, res) => {
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
