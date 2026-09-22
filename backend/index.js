 import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. ES Modules ke liye path resolve karein
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. IMPORTANT: dotenv ko baaqi local routes/configs se PEHLE config karein
dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';

// Debugging line (Ab yeh 'FOUND' dikhayega)
console.log('Loaded MONGODB_URI:', process.env.MONGODB_URI ? 'FOUND' : 'UNDEFINED');

import connectDB from './config/db.js';
import { seedDatabase } from './seed.js';

import authRoutes from './routes/auth.js';
import facultyRoutes from './routes/faculty.js';
import facultyResearchAreaRoutes from './routes/facultyResearchAreas.js';
import facultySlotRoutes from './routes/facultySlots.js';
import researchAreaRoutes from './routes/researchAreas.js';
import studentInterestRoutes from './routes/studentInterests.js';
import recommendationRoutes from './routes/recommendations.js';
import supervisionRequestRoutes from './routes/supervisionRequests.js';
import adminRoutes from './routes/admin.js';

const app = express();

const allowedOrigins = [
  'https://recommendation-system-eosin.vercel.app',
  'https://recommendation-system-gkxe.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Info', 'Apikey'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Seed Database Endpoint
app.get('/api/seed-db', async (_req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database seeded successfully with Admin & Faculty accounts!' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Seeding failed' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/faculty-research-areas', facultyResearchAreaRoutes);
app.use('/api/faculty-slots', facultySlotRoutes);
app.use('/api/research-areas', researchAreaRoutes);
app.use('/api/student-interests', studentInterestRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/search', recommendationRoutes);
app.use('/api/supervision-requests', supervisionRequestRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Supervisor Recommendation API is running.' });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await connectDB();
  } catch (err) {
    console.error('Startup DB connection failed:', err.message);
  }
});

export default app;