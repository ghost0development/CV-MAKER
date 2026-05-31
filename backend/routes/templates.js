import { Router } from 'express';
import { get, all } from '../database.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const templates = await all('SELECT * FROM templates');
    res.json(templates);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const template = await get('SELECT * FROM templates WHERE id = ?', [req.params.id]);
    if (!template) return res.status(404).json({ error: 'Szablon nie znaleziony' });
    res.json(template);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
