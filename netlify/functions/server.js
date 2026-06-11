const express = require('express');
const serverless = require('serverless-http');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const VIEWER_PASSWORD = process.env.VIEWER_PASSWORD;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000
});

async function initializeDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS guests (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            attendance TEXT NOT NULL,
            drinks TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

app.post('/api/login', (req, res) => {
    const { password, role } = req.body;
    if (role === 'admin' && password === ADMIN_PASSWORD) {
        const token = Buffer.from(`admin:${Date.now()}`).toString('base64');
        res.json({ success: true, token });
    } else if (role === 'viewer' && password === VIEWER_PASSWORD) {
        const token = Buffer.from(`viewer:${Date.now()}`).toString('base64');
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, error: 'Неверный пароль' });
    }
});

function verifyToken(req, res, next) {
    const token = req.headers['x-auth-token'];
    if (!token) return res.status(401).json({ error: 'Неавторизован' });
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const [role] = decoded.split(':');
        if (role === 'admin' || role === 'viewer') {
            req.userRole = role;
            next();
        } else {
            res.status(403).json({ error: 'Неверный токен' });
        }
    } catch (err) {
        res.status(403).json({ error: 'Неверный токен' });
    }
}

app.get('/api/guests', verifyToken, async (req, res) => {
    try {
        await initializeDatabase();
        const result = await pool.query('SELECT * FROM guests ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/rsvp', async (req, res) => {
    console.log('=== RSVP START ===');
    console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
    console.log('Body:', req.body);
    
    const { name, attendance, drinks } = req.body;
    
    try {
        console.log('Initializing database...');
        await initializeDatabase();
        console.log('Database ready');
        
        const result = await pool.query(
            'INSERT INTO guests (name, attendance, drinks) VALUES ($1, $2, $3) RETURNING *',
            [name, attendance, drinks ? drinks.join(', ') : '']
        );
        
        console.log('Inserted:', result.rows[0]);
        res.json({ message: 'Анкета сохранена!', id: result.rows[0].id });
    } catch (err) {
        console.error('=== RSVP ERROR ===');
        console.error('Error:', err.message);
        console.error('Stack:', err.stack);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/guests/:id', verifyToken, async (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
    const { id } = req.params;
    const { name, attendance, drinks } = req.body;
    try {
        await initializeDatabase();
        const result = await pool.query(
            'UPDATE guests SET name = $1, attendance = $2, drinks = $3 WHERE id = $4 RETURNING *',
            [name, attendance, drinks ? drinks.join(', ') : '', id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Анкета не найдена' });
        res.json({ message: 'Анкета обновлена!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/guests/:id', verifyToken, async (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
    const { id } = req.params;
    try {
        await initializeDatabase();
        const result = await pool.query('DELETE FROM guests WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Анкета не найдена' });
        res.json({ message: 'Анкета удалена!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '..', '..', 'public', 'admin.html')));
app.get('/viewer', (req, res) => res.sendFile(path.join(__dirname, '..', '..', 'public', 'viewer.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html')));

module.exports.handler = serverless(app);