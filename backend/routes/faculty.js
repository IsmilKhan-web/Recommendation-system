import { Router } from 'express';
import User from '../models/User.js';
import FacultyResearchArea from '../models/FacultyResearchArea.js';
import FacultySlot from '../models/FacultySlot.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

// GET /api/faculty — all faculty with research areas + slots
router.get('/', authRequired, async (_req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty' }).sort({ full_name: 1 });
    const fraList = await FacultyResearchArea.find().populate('research_area_id');
    const slotList = await FacultySlot.find();

    const slotMap = new Map(slotList.map((s) => [String(s.faculty_id), s]));
    const fraMap = new Map();
    for (const fra of fraList) {
      const fid = String(fra.faculty_id);
      if (!fraMap.has(fid)) fraMap.set(fid, []);
      fraMap.get(fid).push({
        ...fra.toJSON(),
        research_area: fra.research_area_id ? fra.research_area_id.toJSON() : null,
      });
    }

    const result = faculty.map((f) => ({
      ...f.toJSON(),
      research_areas: fraMap.get(String(f._id)) ?? [],
      slot: slotMap.get(String(f._id))?.toJSON() ?? null,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
