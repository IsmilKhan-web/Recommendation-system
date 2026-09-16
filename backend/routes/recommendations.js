import { Router } from 'express';
import User from '../models/User.js';
import StudentResearchInterest from '../models/StudentResearchInterest.js';
import FacultyResearchArea from '../models/FacultyResearchArea.js';
import FacultySlot from '../models/FacultySlot.js';
import RecommendationHistory from '../models/RecommendationHistory.js';
import { authRequired, requireRole } from '../middleware/auth.js';

const router = Router();

// ── Tokenizer ──────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'for', 'of', 'to', 'in', 'on', 'at',
  'by', 'with', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'this', 'that', 'these', 'those', 'it', 'its', 'as', 'if', 'then', 'than',
  'so', 'such', 'no', 'not', 'nor', 'only', 'own', 'same', 'too', 'very',
  'can', 'will', 'just', 'should', 'now', 'i', 'me', 'my', 'we', 'our', 'you',
  'your', 'he', 'she', 'they', 'them', 'their', 'what', 'which', 'who', 'whom',
  'how', 'why', 'when', 'where', 'about', 'into', 'through', 'during', 'before',
  'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under',
  'again', 'further', 'once', 'here', 'there', 'all', 'any', 'both', 'each',
  'few', 'more', 'most', 'other', 'some', 'such', 'do', 'does', 'did', 'has',
  'had', 'have', 'having', 'would', 'could', 'may', 'might', 'must', 'shall',
  'using', 'use', 'used', 'based', 'approach', 'research', 'study', 'system',
  'using', 'via', 'towards', 'toward',
]);

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

// ── TF-IDF helpers ─────────────────────────────────────────────────────
function termFreq(tokens) {
  const tf = {};
  for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
  const len = tokens.length || 1;
  for (const t in tf) tf[t] /= len;
  return tf;
}

function cosineSim(vecA, vecB) {
  let dot = 0, magA = 0, magB = 0;
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  for (const k of keys) {
    const a = vecA[k] || 0;
    const b = vecB[k] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Build faculty "document" from research interests, keywords, publications, bio
function buildFacultyDocument(faculty, fraMap) {
  const areas = fraMap.get(String(faculty._id)) ?? [];
  const parts = [
    faculty.bio || '',
    faculty.department || '',
    ...areas.map((a) => `${a.research_area?.name || ''} ${a.research_area?.description || ''}`),
    ...(faculty.research_keywords || []),
    ...(faculty.publications || []),
    ...(faculty.courses || []),
  ];
  return tokenize(parts.join(' '));
}

// ── GET /api/recommendations — weighted-interest matching (existing) ────
router.get('/', authRequired, requireRole('student'), async (req, res) => {
  try {
    const interests = await StudentResearchInterest
      .find({ student_id: req.user._id })
      .populate('research_area_id');

    if (interests.length === 0) return res.json([]);

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

    const facultyWithDetails = faculty.map((f) => ({
      ...f.toJSON(),
      research_areas: fraMap.get(String(f._id)) ?? [],
      slot: slotMap.get(String(f._id))?.toJSON() ?? null,
    }));

    const interestDocs = interests.map((i) => ({
      ...i.toJSON(),
      research_area: i.research_area_id ? i.research_area_id.toJSON() : null,
    }));

    const maxPossible = interestDocs.reduce((sum, i) => sum + i.weight * 5, 0);

    const results = [];
    for (const faculty of facultyWithDetails) {
      const matchedAreas = [];
      let rawSum = 0;

      for (const interest of interestDocs) {
        const fra = faculty.research_areas.find(
          (f) => String(f.research_area_id) === String(interest.research_area_id),
        );
        if (fra) {
          rawSum += interest.weight * fra.weight;
          const areaName = fra.research_area?.name ?? interest.research_area?.name ?? 'Unknown';
          matchedAreas.push({
            id: String(interest.research_area_id),
            name: areaName,
            studentWeight: interest.weight,
            facultyWeight: fra.weight,
          });
        }
      }

      if (matchedAreas.length === 0) continue;

      let score = (rawSum / maxPossible) * 100;
      const total = faculty.slot?.total_slots ?? 0;
      const taken = faculty.slot?.taken_slots ?? 0;
      const available = Math.max(0, total - taken);

      if (total === 0) score -= 10;
      else if (available > 0) score += 8;
      else if (taken <= total + 1) score += 4;

      score = Math.max(0, Math.min(100, Math.round(score)));

      results.push({ faculty, matchScore: score, matchedAreas, availableSlots: available });
    }

    results.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return b.availableSlots - a.availableSlots;
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/recommendations/match — TF-IDF topic matching ────────────
router.post('/match', authRequired, requireRole('student'), async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
      return res.status(400).json({ error: 'Please provide a research topic of at least 3 characters.' });
    }

    const excludeFull = req.body.excludeFull === true;
    const minScore = typeof req.body.minScore === 'number' ? req.body.minScore : 0;

    const queryTokens = tokenize(topic);
    if (queryTokens.length === 0) {
      return res.status(400).json({ error: 'No meaningful keywords found in your topic. Try a more descriptive query.' });
    }
    const queryTF = termFreq(queryTokens);

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

    // Build corpus documents and compute IDF
    const docs = faculty.map((f) => buildFacultyDocument(f, fraMap));
    const N = docs.length || 1;
    const df = {};
    for (const tokens of docs) {
      const seen = new Set(tokens);
      for (const t of seen) df[t] = (df[t] || 0) + 1;
    }
    const idf = {};
    for (const t in df) idf[t] = Math.log((N + 1) / (df[t] + 1)) + 1;

    // TF-IDF vectors
    const docVectors = docs.map((tokens) => {
      const tf = termFreq(tokens);
      const vec = {};
      for (const t in tf) vec[t] = tf[t] * (idf[t] || 1);
      return vec;
    });
    const queryVector = {};
    for (const t in queryTF) queryVector[t] = queryTF[t] * (idf[t] || 1);

    const results = [];
    for (let i = 0; i < faculty.length; i++) {
      const f = faculty[i];
      const similarity = cosineSim(queryVector, docVectors[i]);
      const slot = slotMap.get(String(f._id));
      const total = slot?.total_slots ?? 0;
      const taken = slot?.taken_slots ?? 0;
      const available = Math.max(0, total - taken);

      // Capacity constraint: exclude or down-rank
      if (excludeFull && total > 0 && available === 0) continue;

      // Find matched keywords (tokens that appear in both query and faculty doc)
      const facultyTokens = new Set(docs[i]);
      const matchedKeywords = queryTokens.filter((t) => facultyTokens.has(t));

      if (matchedKeywords.length === 0 && similarity === 0) continue;

      // Score: cosine similarity * 100, adjusted by capacity
      let score = similarity * 100;
      if (total === 0) score *= 0.85;       // down-rank if not accepting
      else if (available === 0) score *= 0.9; // down-rank if full
      else score *= 1.05;                      // boost if slots open

      // Keyword overlap bonus
      const overlapRatio = matchedKeywords.length / queryTokens.length;
      score = score * 0.7 + overlapRatio * 30;

      score = Math.max(0, Math.min(100, Math.round(score)));

      if (score < minScore) continue;

      const facultyWithDetails = {
        ...f.toJSON(),
        research_areas: fraMap.get(String(f._id)) ?? [],
        slot: slot?.toJSON() ?? null,
      };

      results.push({
        faculty: facultyWithDetails,
        matchScore: score,
        matchedKeywords: dedupeKeywords(matchedKeywords),
        availableSlots: available,
        totalSlots: total,
        similarity: Math.round(similarity * 100) / 100,
      });
    }

    results.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return b.availableSlots - a.availableSlots;
    });

    // Save to recommendation history
    if (results.length > 0) {
      await RecommendationHistory.create({
        student_id: req.user._id,
        search_topic: topic.trim(),
        recommended_supervisors: results.slice(0, 20).map((r) => ({
          faculty_id: r.faculty.id,
          score: r.matchScore,
          matched_keywords: r.matchedKeywords,
        })),
      });
    }

    res.json({ topic: topic.trim(), queryKeywords: [...new Set(queryTokens)], results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function dedupeKeywords(keywords) {
  return [...new Set(keywords)].slice(0, 12);
}

// ── GET /api/recommendations/history — student's search history ────────
router.get('/history', authRequired, requireRole('student'), async (req, res) => {
  try {
    const history = await RecommendationHistory
      .find({ student_id: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('recommended_supervisors.faculty_id', 'full_name email department bio');
    res.json(history.map((h) => h.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
