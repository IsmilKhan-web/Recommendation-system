 import { Router } from 'express';
import User from '../models/User.js';

const router = Router();

// POST /api/recommendations/match OR /api/recommendations/search
router.post('/match', async (req, res) => {
  try {
    const { topic, query, minMatch = 0, excludeFull = false } = req.body;
    const searchTerms = topic || query || '';

    // Faculty members fetch karein
    let facultyMembers = await User.find({ role: 'faculty' });

    if (excludeFull) {
      facultyMembers = facultyMembers.filter(f => (f.max_students || 5) > (f.current_students || 0));
    }

    return res.json({
      success: true,
      matches: facultyMembers,
      results: facultyMembers
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;