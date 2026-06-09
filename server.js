require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Пароли из переменных окружения
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const VIEWER_PASSWORD = process.env.VIEWER_PASSWORD;

// Проверка при запуске
if (!ADMIN_PASSWORD || !VIEWER_PASSWORD) {
    console.error('❌ Ошибка: Не заданы пароли в переменных окружения!');
    console.error('Создайте файл .env или настройте переменные в Railway');
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL подключение
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { 
        rejectUnauthorized: false 
    } : false
});

// Создание таблицы при запуске
async function initializeDatabase() {
    if (!process.env.DATABASE_URL) {
        console.log('⚠️  DATABASE_URL не задан. Пропускаем инициализацию БД.');
        console.log('   На Railway база создастся автоматически.');
        return;
    }
    
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS guests (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                attendance TEXT NOT NULL,
                drinks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ База данных инициализирована');
    } catch (err) {
        console.error('❌ Ошибка инициализации БД:', err.message);
        console.log('   Проверьте DATABASE_URL в .env файле');
    }
}

// API для сохранения анкеты (публичный)
app.post('/api/rsvp', async (req, res) => {
    const { name, attendance, drinks } = req.body;
    
    try {
        const result = await pool.query(
            'INSERT INTO guests (name, attendance, drinks) VALUES ($1, $2, $3) RETURNING *',
            [name, attendance, drinks ? drinks.join(', ') : '']
        );
        res.json({ message: 'Анкета сохранена!', id: result.rows[0].id });
    } catch (err) {
        console.error('Ошибка сохранения:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// API для просмотра всех анкет
app.get('/api/guests', async (req, res) => {
    const password = req.headers['x-password'];
    
    if (password !== ADMIN_PASSWORD && password !== VIEWER_PASSWORD) {
        return res.status(403).json({ error: 'Неверный пароль' });
    }
    
    try {
        const result = await pool.query('SELECT * FROM guests ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API для редактирования (только админ)
app.put('/api/admin/guests/:id', async (req, res) => {
    const password = req.headers['x-admin-password'];
    
    if (password !== ADMIN_PASSWORD) {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const { id } = req.params;
    const { name, attendance, drinks } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE guests SET name = $1, attendance = $2, drinks = $3 WHERE id = $4 RETURNING *',
            [name, attendance, drinks ? drinks.join(', ') : '', id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Анкета не найдена' });
        }
        
        res.json({ message: 'Анкета обновлена!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API для удаления (только админ)
app.delete('/api/admin/guests/:id', async (req, res) => {
    const password = req.headers['x-admin-password'];
    
    if (password !== ADMIN_PASSWORD) {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const { id } = req.params;
    
    try {
        const result = await pool.query('DELETE FROM guests WHERE id = $1 RETURNING *');
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Анкета не найдена' });
        }
        
        res.json({ message: 'Анкета удалена!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Страницы
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/viewer', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'viewer.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
app.listen(PORT, async () => {
    console.log(`🎉 Сервер запущен: http://localhost:${PORT}`);
    console.log(`💝 Приглашение Евгении и Алексея готово!`);
    console.log(`🔐 Админка: http://localhost:${PORT}/admin`);
    console.log(`👁️ Просмотр: http://localhost:${PORT}/viewer`);
    
    await initializeDatabase();
});