import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cv-maker-secret-kurwa-mocny-klucz-2024';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Brak tokena autoryzacji' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Token wygasł lub jest nieprawidłowy' });
  }
}

export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}
