
CV Maker Backend - Server Entry Point
Enterprise-grade Express application for CV Maker platform.
"""
import express from 'express';
import cors from 'cors';
import { networkInterfaces } from 'os';
import { getDb } from './database.js';
import authRoutes from './routes/auth.js';
import cvRoutes from './routes/cvs.js';
import templateRoutes from './routes/templates.js';
import jobRoutes from './routes/jobs.js';
import { SERVER_CONFIG, CORS_CONFIG, APP_CONFIG } from './config.js';

// Create Express application
const app = express();

// Middleware configuration
app.use(cors(CORS_CONFIG));
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/cvs', cvRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/jobs', jobRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: `${APP_CONFIG.NAME} API is running!`,
    version: APP_CONFIG.VERSION
  });
});

/**
 * Get local IP address for display purposes
 * @returns {string} Local IP address or 'localhost' if not found
 */
function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

/**
 * Start the server and initialize database connection
 */
async function start() {
  try {
    // Initialize database connection
    await getDb();
    console.log('Database connected via libSQL/sqld');
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    process.exit(1);
  }

  // Start HTTP server
  app.listen(SERVER_CONFIG.PORT, SERVER_CONFIG.HOST, () => {
    const ip = getLocalIP();
    console.log('');
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║        CV MAKER - Backend API                ║');
    console.log('╠═══════════════════════════════════════════════╣');
    console.log(`║  Local:    http://localhost:${String(SERVER_CONFIG.PORT).padEnd(5)}              ║`);
    console.log(`║  Network:  http://${ip.padEnd(14)}:${SERVER_CONFIG.PORT}           ║`);
    console.log(`║  SQL sync: http://${ip.padEnd(14)}:8080 (sqld)   ║`);
    console.log('╚═══════════════════════════════════════════════╝');
    console.log('');
  });
}

// Start the application
start();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});