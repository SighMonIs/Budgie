import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.put('/', (req, res) => {
  const allowed = ['pay_amount', 'next_payday', 'theme'];
  const keys = allowed.filter(k => k in req.body);
  if (keys.length) {
    getDb().prepare(`UPDATE settings SET ${keys.map(k => `${k}=?`).join(', ')} WHERE id=1`)
      .run(...keys.map(k => req.body[k]));
  }
  res.json({ ok: true });
});

export default router;
