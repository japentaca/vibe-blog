import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import session from 'express-session';
import SQLiteStore from 'connect-sqlite3';

// Configurar dotenv
dotenv.config();

// Obtener __dirname en ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import postsRouter from './routes/posts.js';
import uploadRouter from './routes/upload.js';
import authRouter from './routes/auth.js';
import errorHandler from './middleware/errorHandler.js';

// Import database
import db from './config/database.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Configurar SQLite store para sesiones
const SQLiteStoreSession = SQLiteStore(session);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Will be handled by frontend
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Configurar sesiones
app.use(session({
  store: new SQLiteStoreSession({
    db: 'sessions.db',
    dir: path.join(__dirname, '../database'),
    table: 'sessions'
  }),
  secret: process.env.SESSION_SECRET || 'tu-clave-secreta-muy-segura-cambiala-en-produccion',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS en producción
    httpOnly: true, // Prevenir acceso desde JavaScript del cliente
    maxAge: 24 * 60 * 60 * 1000, // 24 horas por defecto
    sameSite: 'lax' // Protección CSRF
  },
  name: 'blog.sid' // Nombre personalizado para la cookie
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/resources', express.static(path.join(__dirname, '../frontend/resources')));

// Serve frontend static files
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/upload', uploadRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Blog API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint - serve main blog page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Serve specific frontend pages
app.get('/editor', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/editor.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/about.html'));
});

app.get('/post', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/post.html'));
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
async function initializeServer() {
  try {
    // Test database connection
    await db.raw('SELECT 1');
    console.log('✅ Database connected successfully');

    // Run migrations
    await db.migrate.latest();
    console.log('✅ Database migrations completed');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Blog backend server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`📊 Health check at http://localhost:${PORT}/api/health`);
    });

  } catch (error) {
    console.error('❌ Failed to initialize server:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  try {
    await db.destroy();
    console.log('🔌 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
});

// Start the server
initializeServer();