import { Router } from 'express';
import StudentResearchInterest from '../models/StudentResearchInterest.js';
import { authRequired, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/student-interests/:studentId
router.get('/:studentId', authRequired, async (req, res) => {
  try {
    const interests = await StudentResearchInterest
      .find({ student_id: req.params.studentId })
      .populate('research_area_id');
    const result = interests.map((i) => ({
      ...i.toJSON(),
      research_area: i.research_area_id ? i.research_area_id.toJSON() : null,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/student-interests — bulk replace the student's interests
router.put('/', authRequired, requireRole('student'), async (req, res) => {
  try {
    const { interests } = req.body;
    if (!Array.isArray(interests)) {
      return res.status(400).json({ error: 'interests array required' });
    }
    await StudentResearchInterest.deleteMany({ student_id: req.user._id });
    if (interests.length > 0) {
      const docs = interests.map((i) => ({
        student_id: req.user._id,
        research_area_id: i.research_area_id,
        weight: Math.max(1, Math.min(5, i.weight ?? 3)),
      }));
      await StudentResearchInterest.insertMany(docs);
    }
    const updated = await StudentResearchInterest
      .find({ student_id: req.user._id })
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
