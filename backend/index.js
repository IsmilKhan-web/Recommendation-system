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

// Flag to track seeding execution
let isSeeded = false;

// Serverless-friendly MongoDB Connection Wrapper
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('CRITICAL: MONGODB_URI environment variable is missing!');
    return;
  }

  try {
    await mongoose.connect(mongoUri.trim());
    console.log('MongoDB connected successfully');

    if (!isSeeded) {
      await seedMasterAdmin();
      isSeeded = true;
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
};

// Middleware to ensure DB is connected before handling any API request
app.use(async (_req, _res, next) => {
  await connectDB();
  next();
});

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
    // E11000 duplicate key error safety check
    if (error.code === 11000) return;
    console.error('Error seeding admin:', error.message);
  }
}

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;