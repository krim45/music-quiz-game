import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { id, password } = req.body;

  if (id === process.env.ADMIN_ID && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });

    return res.json({ token });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

export default router;
