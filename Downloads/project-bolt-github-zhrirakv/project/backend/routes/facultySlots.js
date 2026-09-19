import { Router } from 'express';
import FacultySlot from '../models/FacultySlot.js';
import { authRequired, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/faculty-slots/:facultyId
router.get('/:facultyId', authRequired, async (req, res) => {
  try {
    const slot = await FacultySlot.findOne({ faculty_id: req.params.facultyId });
    res.json(slot ? slot.toJSON() : null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/faculty-slots — upsert the faculty's own slots
router.put('/', authRequired, requireRole('faculty'), async (req, res) => {
  try {
    const { total_slots, taken_slots } = req.body;
    const filter = { faculty_id: req.user._id };
    const update = {
      total_slots: Math.max(0, total_slots ?? 0),
      taken_slots: Math.max(0, taken_slots ?? 0),
    };
    const slot = await FacultySlot.findOneAndUpdate(filter, update, {
      upsert: true, new: true,
    });
    res.json(slot.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
