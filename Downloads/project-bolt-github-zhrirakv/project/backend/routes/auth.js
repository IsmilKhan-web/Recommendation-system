import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import AuthorizedUser from '../models/AuthorizedUser.js';
import { signToken, verifyToken } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName, role, department } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (role !== 'student') {
      return res.status(400).json({ error: 'Only student accounts can be self-registered.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      full_name: fullName.trim(),
      email: normalizedEmail,
      password: hashed,
      role,
      department: department || '',
    });

    const token = signToken(user);
    return res.status(201).json({ token, profile: user.toJSON() });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ error: 'Email already registered' });
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role: requestedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    if (!['student', 'faculty', 'admin'].includes(requestedRole)) {
      return res.status(400).json({ error: 'A valid role is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(403).json({ error: 'Access Denied: You are not an authorized user.' });
    }
    if (!['student', 'faculty', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Access Denied: unsupported account role.' });
    }
    if (requestedRole !== user.role) {
      return res.status(403).json({ error: `This account is not registered as ${requestedRole}.` });
    }

    // Faculty and admin must exist in the AuthorizedUser collection
    if (user.role === 'faculty' || user.role === 'admin') {
      const authorized = await AuthorizedUser.exists({ email: normalizedEmail, role: user.role });
      if (!authorized) {
        return res.status(403).json({ error: 'Access Denied: You are not an authorized user.' });
      }
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user);
    return res.json({ token, profile: user.toJSON() });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  res.json({ profile: req.user.toJSON() });
});

// PUT /api/auth/me
router.put('/me', verifyToken, async (req, res) => {
  try {
    const { bio, department, office_hours, courses, publications, research_keywords } = req.body;
    const updates = {};
    if (bio !== undefined) updates.bio = bio;
    if (department !== undefined) updates.department = department;
    if (office_hours !== undefined) updates.office_hours = office_hours;
    if (courses !== undefined) updates.courses = courses;
    if (publications !== undefined) updates.publications = publications;
    if (research_keywords !== undefined) updates.research_keywords = research_keywords;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    return res.json({ profile: user.toJSON() });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
