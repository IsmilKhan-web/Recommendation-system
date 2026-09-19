import { Router } from 'express';
import User from '../models/User.js';
import FacultyResearchArea from '../models/FacultyResearchArea.js';
import FacultySlot from '../models/FacultySlot.js';
import StudentResearchInterest from '../models/StudentResearchInterest.js';
import RecommendationHistory from '../models/RecommendationHistory.js';
import { authRequired, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/recommendations — ranked supervisor matches based on student interests
router.get('/', authRequired, requireRole('student'), async (req, res) => {
  try {
    const [faculty, fraList, slotList, interests] = await Promise.all([
      User.find({ role: 'faculty' }).sort({ full_name: 1 }),
      FacultyResearchArea.find().populate('research_area_id'),
      FacultySlot.find(),
      StudentResearchInterest.find({ student_id: req.user._id }).populate('research_area_id'),
    ]);

    if (!interests.length) {
      return res.json([]);
    }

    const slotMap = new Map(slotList.map((s) => [String(s.faculty_id), s]));
    const fraMap = new Map();
    for (const fra of fraList) {
      const fid = String(fra.faculty_id);
      if (!fraMap.has(fid)) fraMap.set(fid, []);
      fraMap.get(fid).push({
        research_area_id: String(fra.research_area_id),
        weight: fra.weight,
        research_area: fra.research_area_id ? fra.research_area_id.toJSON() : null,
      });
    }

    const studentAreaMap = new Map(interests.map((i) => [String(i.research_area_id), i.weight]));
    const studentWeightSum = interests.reduce((sum, i) => sum + i.weight, 0) || 1;

    const results = faculty
      .map((f) => {
        const fid = String(f._id);
        const facultyAreas = fraMap.get(fid) ?? [];
        const matchedAreas = [];
        let overlapScore = 0;

        for (const fa of facultyAreas) {
          const studentWeight = studentAreaMap.get(fa.research_area_id);
          if (studentWeight !== undefined) {
            overlapScore += studentWeight * fa.weight;
            matchedAreas.push({
              id: fa.research_area_id,
              name: fa.research_area?.name ?? 'Unknown',
              studentWeight,
              facultyWeight: fa.weight,
            });
          }
        }

        if (overlapScore === 0) return null;

        const maxPossible = studentWeightSum * 5; // each faculty weight max 5
        const researchScore = Math.round((overlapScore / maxPossible) * 100);

        const slot = slotMap.get(fid);
        const total = slot?.total_slots ?? 0;
        const taken = slot?.taken_slots ?? 0;
        const available = Math.max(0, total - taken);
        const availabilityBonus = available > 0 ? 5 : 0;

        const matchScore = Math.min(100, Math.round(researchScore * 0.9) + availabilityBonus);

        return {
          faculty: {
            ...f.toJSON(),
            research_areas: facultyAreas,
            slot: slot ? slot.toJSON() : null,
          },
          matchScore,
          matchedAreas,
          availableSlots: available,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/recommendations/match — topic/TF-IDF based search (also /api/search/match)
router.post('/match', authRequired, requireRole('student'), async (req, res) => {
  try {
    const { topic, query, minMatch = 0, excludeFull = false } = req.body;
    const searchTopic = (topic || query || '').trim();

    if (searchTopic.length < 3) {
      return res.status(400).json({ error: 'Topic must be at least 3 characters.' });
    }

    const [faculty, fraList, slotList] = await Promise.all([
      User.find({ role: 'faculty' }).sort({ full_name: 1 }),
      FacultyResearchArea.find().populate('research_area_id'),
      FacultySlot.find(),
    ]);

    const slotMap = new Map(slotList.map((s) => [String(s.faculty_id), s]));
    const fraMap = new Map();
    for (const fra of fraList) {
      const fid = String(fra.faculty_id);
      if (!fraMap.has(fid)) fraMap.set(fid, []);
      fraMap.get(fid).push({
        research_area_id: String(fra.research_area_id),
        weight: fra.weight,
        research_area: fra.research_area_id ? fra.research_area_id.toJSON() : null,
      });
    }

    // Simple keyword extraction: lowercase, split on non-alphanumerics, remove stopwords
    const stopwords = new Set([
      'the', 'a', 'an', 'and', 'or', 'for', 'of', 'to', 'in', 'on', 'at', 'by',
      'with', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'this',
      'that', 'these', 'those', 'it', 'its', 'as', 'if', 'then', 'than', 'but',
      'not', 'no', 'yes', 'so', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'i', 'we', 'you', 'they', 'he', 'she',
      'my', 'our', 'your', 'their', 'me', 'us', 'them', 'about', 'how', 'what',
      'which', 'who', 'whom', 'whose', 'when', 'where', 'why', 'use', 'using',
      'based', 'study', 'research', 'project', 'work', 'system', 'using',
    ]);

    const queryWords = searchTopic
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 3 && !stopwords.has(w));

    const queryKeywords = [...new Set(queryWords)];

    // Build faculty document vectors
    const results = faculty
      .map((f) => {
        const fid = String(f._id);
        const facultyAreas = fraMap.get(fid) ?? [];
        const slot = slotMap.get(fid);
        const total = slot?.total_slots ?? 0;
        const taken = slot?.taken_slots ?? 0;
        const available = Math.max(0, total - taken);

        if (excludeFull && available === 0) return null;

        // Gather all faculty text
        const areaNames = facultyAreas.map((fa) => fa.research_area?.name ?? '').filter(Boolean);
        const allText = [
          f.full_name || '',
          f.department || '',
          f.bio || '',
          ...f.research_keywords,
          ...areaNames,
          ...(f.publications || []),
          ...(f.courses || []),
        ].join(' ').toLowerCase();

        const facultyWords = new Set(
          allText.split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !stopwords.has(w))
        );

        // Calculate matched keywords
        const matchedKeywords = queryKeywords.filter((kw) =>
          facultyWords.has(kw) ||
          facultyWords.has(kw.replace(/s$/, '')) ||
          facultyWords.has(kw + 's') ||
          [...facultyWords].some((fw) => fw.includes(kw) || kw.includes(fw))
        );

        if (matchedKeywords.length === 0) return null;

        // TF-IDF-like similarity: matched / total query keywords
        const similarity = matchedKeywords.length / queryKeywords.length;
        const matchScore = Math.round(similarity * 100);

        if (matchScore < minMatch) return null;

        return {
          faculty: {
            ...f.toJSON(),
            research_areas: facultyAreas,
            slot: slot ? slot.toJSON() : null,
          },
          matchScore,
          matchedKeywords,
          availableSlots: available,
          totalSlots: total,
          similarity: Math.round(similarity * 1000) / 1000,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.matchScore - a.matchScore);

    // Save search history
    try {
      await RecommendationHistory.create({
        student_id: req.user._id,
        search_topic: searchTopic,
        recommended_supervisors: results.slice(0, 10).map((r) => ({
          faculty_id: r.faculty.id,
          score: r.matchScore,
          matched_keywords: r.matchedKeywords,
        })),
      });
    } catch (historyErr) {
      console.error('Failed to save search history:', historyErr.message);
    }

    res.json({
      topic: searchTopic,
      queryKeywords,
      results,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recommendations/history — student's search history
router.get('/history', authRequired, requireRole('student'), async (req, res) => {
  try {
    const history = await RecommendationHistory.find({ student_id: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(history.map((h) => h.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
