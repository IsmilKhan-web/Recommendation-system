 import { Router } from 'express';
import User from '../models/User.js';

const router = Router();

// POST /api/recommendations/search YA /api/search
router.post('/', async (req, res) => {
  try {
    const { query, minMatch, excludeFull } = req.body;

    let filter = { role: 'faculty' };
    
    // Fetch faculty members from DB
    const faculty = await User.find(filter);

    // Simple matching or TF-IDF logic
    res.json({
      success: true,
      data: faculty
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;