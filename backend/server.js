import express from 'express';
import cors from 'cors';
import { networkInterfaces } from 'os';
import { getDb } from './database.js';
import authRoutes from './routes/auth.js';
import cvRoutes from './routes/cvs.js';
import templateRoutes from './routes/templates.js';
import jobRoutes from './routes/jobs.js';

const app = express();
const PORT = String(process.env.PORT || 3000);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/cvs', cvRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/jobs', jobRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CV Maker API działa!' });
});

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

async function start() {
  try {
    await getDb();
    console.log('Database connected via libSQL/sqld');
  } catch (err) {
    console.error('Database init failed:', err.message);
    process.exit(1);
  }

  app.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalIP();
    console.log('');
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║        CV MAKER - Backend API                ║');
    console.log('╠═══════════════════════════════════════════════╣');
    console.log(`║  Local:    http://localhost:${PORT.padEnd(5)}              ║`);
    console.log(`║  Network:  http://${ip.padEnd(14)}:${PORT}           ║`);
    console.log(`║  SQL sync: http://${ip.padEnd(14)}:8080 (sqld)   ║`);
    console.log('╚═══════════════════════════════════════════════╝');
    console.log('');
  });
}

start();
