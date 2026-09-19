import { Router } from 'express';
import ResearchArea from '../models/ResearchArea.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

// GET /api/research-areas
router.get('/', authRequired, async (_req, res) => {
  try {
    const areas = await ResearchArea.find().sort({ name: 1 });
    res.json(areas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
