import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { get, run } from '../database.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, hasło i nazwa są wymagane' });
    }

    const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({ error: 'Email już zajęty' });
    }

    const id = uuidv4();
    const hashed = bcrypt.hashSync(password, 10);
    await run('INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)', [id, email, hashed, name]);

    const token = generateToken(id);
    res.status(201).json({ token, user: { id, email, name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email i hasło są wymagane' });
    }

    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
    }

    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await get('SELECT id, email, name FROM users WHERE id = ?', [req.userId]);
    if (!user) return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
