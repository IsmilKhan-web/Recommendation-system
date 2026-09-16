 import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import researchAreaRoutes from './routes/researchAreas.js';
import facultyRoutes from './routes/faculty.js';
import studentInterestRoutes from './routes/studentInterests.js';
import facultySlotRoutes from './routes/facultySlots.js';
import facultyResearchAreaRoutes from './routes/facultyResearchAreas.js';
import recommendationRoutes from './routes/recommendations.js';
import supervisionRequestRoutes from './routes/supervisionRequests.js';
import adminRoutes from './routes/admin.js';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/research-areas', researchAreaRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/student-interests', studentInterestRoutes);
app.use('/api/faculty-slots', facultySlotRoutes);
app.use('/api/faculty-research-areas', facultyResearchAreaRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/supervision-requests', supervisionRequestRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/supervisor_match';

// MongoDB Connection Logic
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    return seedMasterAdmin();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

async function seedMasterAdmin() {
  try {
    const email = 'admin@university.edu.pk';
    const existing = await User.findOne({ email });
    if (existing) return;

    const password = await bcrypt.hash('AdminPassword123!', 10);
    await User.create({
      full_name: 'Master Administrator',
      email,
      password,
      role: 'admin',
      department: '',
    });
    console.log(`Seeded master admin account: ${email}`);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
  }
}

// Local development ke liye listen karega
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Vercel Serverless Function ke liye Export (Zaroori Step)
export default app;