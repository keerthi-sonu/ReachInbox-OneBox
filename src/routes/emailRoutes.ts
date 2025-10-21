import express from 'express';
import { searchEmails } from '../elasticService';

const router = express.Router();

router.get('/search', async (req, res) => {
  const q = req.query.q as string;
  const results = await searchEmails(q || '');
  res.json(results);
});

export default router;
