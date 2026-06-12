require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet'); // ← ДОБАВЛЕНО

const app = express();
const PORT = process.env.PORT || 3000;

// Пароли из переменных окружения
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const VIEWER_PASSWORD = process.env.VIEWER_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;

// Проверка при запуске
if (!ADMIN_PASSWORD || !VIEWER_PASSWORD) {
    console.error('❌ Ошибка: Не заданы пароли в переменных окружения!');
    process.exit(1);
}

if (!JWT_SECRET) {
    console.error('❌ Ошибка: Не задан JWT_SECRET в переменных окружения!');
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ===== HELMET.JS - HTTP ЗАГОЛОВКИ БЕЗОПАСНОСТИ =====
app.use(helmet());

// Content Security Policy (CSP)
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // разрешаем inline скрипты в HTML
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
    },
}));

// Дополнительные заголовки
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));
app.use(helmet.permittedCrossDomainPolicies({ permittedPolicies: 'none' }));
// ===================================================

// Rate limiting
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { 
        error: 'Слишком много попыток входа. Попробуйте через 15 минут.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const rsvpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { error: 'Слишком много заявок. Попробуйте позже.' },
});

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
    }
}

// ===== Middleware для проверки JWT токена =====
function verifyToken(req, res, next) {
    const token = req.headers['x-auth-token'];
    
    if (!token) {
        return res.status(401).json({ error: 'Неавторизован' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.role === 'admin' || decoded.role === 'viewer') {
            req.userRole = decoded.role;
            next();
        } else {
            res.status(403).json({ error: 'Неверная роль в токене' });
        }
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Срок действия токена истек',
                code: 'TOKEN_EXPIRED'
            });
        }
        res.status(403).json({ error: 'Неверный токен' });
    }
}

// API для сохранения анкеты (публичный)
app.post('/api/rsvp', rsvpLimiter, async (req, res) => {
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

// API для просмотра всех анкет (для обеих ролей)
app.get('/api/guests', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM guests ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API для редактирования (только админ)
app.put('/api/admin/guests/:id', verifyToken, async (req, res) => {
    if (req.userRole !== 'admin') {
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
app.delete('/api/admin/guests/:id', verifyToken, async (req, res) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const { id } = req.params;
    
    try {
        const result = await pool.query('DELETE FROM guests WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Анкета не найдена' });
        }
        
        res.json({ message: 'Анкета удалена!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== API для проверки пароля (логин) =====
app.post('/api/login', loginLimiter, (req, res) => {
    const { password, role } = req.body;
    
    if (role === 'admin' && password === ADMIN_PASSWORD) {
        const accessToken = jwt.sign(
            { role: 'admin' },
            JWT_SECRET,
            { expiresIn: '15m' }
        );
        
        const refreshToken = jwt.sign(
            { role: 'admin' },
            JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ 
            success: true, 
            accessToken,
            refreshToken
        });
    } else if (role === 'viewer' && password === VIEWER_PASSWORD) {
        const accessToken = jwt.sign(
            { role: 'viewer' },
            JWT_SECRET,
            { expiresIn: '15m' }
        );
        
        const refreshToken = jwt.sign(
            { role: 'viewer' },
            JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ 
            success: true, 
            accessToken,
            refreshToken
        });
    } else {
        res.status(401).json({ success: false, error: 'Неверный пароль' });
    }
});

// ===== API для обновления токена =====
app.post('/api/refresh-token', (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token не предоставлен' });
    }
    
    try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        
        const newAccessToken = jwt.sign(
            { role: decoded.role },
            JWT_SECRET,
            { expiresIn: '15m' }
        );
        
        res.json({ 
            success: true, 
            accessToken: newAccessToken 
        });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Refresh token истек. Пожалуйста, войдите снова.',
                code: 'REFRESH_TOKEN_EXPIRED'
            });
        }
        res.status(403).json({ error: 'Неверный refresh token' });
    }
});

// ===== API для logout =====
app.post('/api/logout', (req, res) => {
    res.json({ success: true, message: 'Выход выполнен' });
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/viewer', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'viewer.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Ошибка сервера:', err.stack);
    res.status(500).json({ 
        error: 'Внутренняя ошибка сервера',
        code: 'INTERNAL_ERROR'
    });
});

// Запуск сервера
app.listen(PORT, async () => {
    console.log(`🎉 Сервер запущен: http://localhost:${PORT}`);
    console.log(`💝 Приглашение Евгении и Алексея готово!`);
    console.log(`🔐 Админка: http://localhost:${PORT}/admin`);
    console.log(`👁️ Просмотр: http://localhost:${PORT}/viewer`);
    console.log(`🛡️ Helmet.js активирован - HTTP заголовки безопасности включены`);
    
    await initializeDatabase();
});