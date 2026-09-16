import { Router } from 'express';
import FacultyResearchArea from '../models/FacultyResearchArea.js';
import { authRequired, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/faculty-research-areas/me — get the logged-in faculty's research areas
router.get('/me', authRequired, requireRole('faculty'), async (req, res) => {
  try {
    const list = await FacultyResearchArea
      .find({ faculty_id: req.user._id })
      .populate('research_area_id');
    const result = list.map((i) => ({
      ...i.toJSON(),
      research_area: i.research_area_id ? i.research_area_id.toJSON() : null,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/faculty-research-areas — bulk replace the faculty's research areas
router.put('/', authRequired, requireRole('faculty'), async (req, res) => {
  try {
    const { areas } = req.body;
    if (!Array.isArray(areas)) {
      return res.status(400).json({ error: 'areas array required' });
    }
    await FacultyResearchArea.deleteMany({ faculty_id: req.user._id });
    if (areas.length > 0) {
      const docs = areas.map((a) => ({
        faculty_id: req.user._id,
        research_area_id: a.research_area_id,
        weight: Math.max(1, Math.min(5, a.weight ?? 3)),
      }));
      await FacultyResearchArea.insertMany(docs);
    }
    const updated = await FacultyResearchArea
      .find({ faculty_id: req.user._id })
      .populate('research_area_id');
    const result = updated.map((i) => ({
      ...i.toJSON(),
      research_area: i.research_area_id ? i.research_area_id.toJSON() : null,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
