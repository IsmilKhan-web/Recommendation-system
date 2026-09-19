import { Router } from 'express';
import SupervisionRequest from '../models/SupervisionRequest.js';
import FacultySlot from '../models/FacultySlot.js';
import User from '../models/User.js';
import { authRequired, requireRole } from '../middleware/auth.js';

const router = Router();

function serializeRequest(request) {
  const result = request.toJSON();
  result.student = request.student_id ? request.student_id.toJSON() : null;
  result.faculty = request.faculty_id ? request.faculty_id.toJSON() : null;
  result.student_id = String(request.student_id?._id ?? request.student_id);
  result.faculty_id = String(request.faculty_id?._id ?? request.faculty_id);
  return result;
}

// GET /api/supervision-requests/me
router.get('/me', authRequired, requireRole('student'), async (req, res) => {
  try {
    const requests = await SupervisionRequest.find({ student_id: req.user._id })
      .populate('faculty_id')
      .sort({ createdAt: -1 });
    res.json(requests.map(serializeRequest));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/supervision-requests
router.post('/', authRequired, requireRole('student'), async (req, res) => {
  try {
    const { faculty_id, project_mode, group_members, project_proposal } = req.body;
    if (!faculty_id || !project_mode || !project_proposal?.trim()) {
      return res.status(400).json({ error: 'Supervisor, project mode, and proposal are required' });
    }
    if (!['Solo', 'Group'].includes(project_mode)) {
      return res.status(400).json({ error: 'Invalid project mode' });
    }

    const members = Array.isArray(group_members)
      ? group_members.map((member) => String(member).trim()).filter(Boolean)
      : [];
    if (project_mode === 'Group' && members.length === 0) {
      return res.status(400).json({ error: 'Add at least one group member' });
    }

    const faculty = await User.findOne({ _id: faculty_id, role: 'faculty' });
    if (!faculty) return res.status(404).json({ error: 'Supervisor not found' });

    const duplicate = await SupervisionRequest.findOne({
      student_id: req.user._id,
      faculty_id,
      status: { $in: ['pending', 'approved'] },
    });
    if (duplicate) return res.status(409).json({ error: 'You already have an active request for this supervisor' });

    const request = await SupervisionRequest.create({
      student_id: req.user._id,
      student_email: req.user.email,
      student_details: {
        full_name: req.user.full_name,
        email: req.user.email,
        department: req.user.department || '',
      },
      faculty_id,
      project_mode,
      group_members: members,
      project_title: String(req.body.project_title || project_proposal).trim().split('\n')[0],
      project_proposal: project_proposal.trim(),
    });
    await request.populate('faculty_id');
    res.status(201).json(serializeRequest(request));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/supervision-requests/pending
router.get('/pending', authRequired, requireRole('faculty'), async (req, res) => {
  try {
    const requests = await SupervisionRequest.find({ faculty_id: req.user._id,     status: 'pending' })
      .populate('student_id')
      .sort({ createdAt: 1 });
    res.json(requests.map(serializeRequest));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/supervision-requests/approved
router.get('/approved', authRequired, requireRole('faculty'), async (req, res) => {
  try {
    const requests = await SupervisionRequest.find({ faculty_id: req.user._id, status: 'approved' })
      .populate('student_id')
      .sort({ createdAt: 1 });
    res.json(requests.map(serializeRequest));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/supervision-requests/:id/status
router.patch('/:id/status', authRequired, requireRole('faculty'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'denied'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or denied' });
    }

    const request = await SupervisionRequest.findOne({
      _id: req.params.id,
      faculty_id: req.user._id,
    });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') return res.status(409).json({ error: 'Request has already been reviewed' });

    if (status === 'approved') {
      const slot = await FacultySlot.findOne({ faculty_id: req.user._id });
      if (!slot || slot.taken_slots >= slot.total_slots) {
        return res.status(409).json({ error: 'No supervision slots are available' });
      }
      slot.taken_slots += 1;
      await slot.save();
    }

    request.status = status;
    await request.save();
    await request.populate(['student_id', 'faculty_id']);
    res.json(serializeRequest(request));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
