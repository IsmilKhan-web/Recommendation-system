import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.js';
import facultyRoutes from './routes/faculty.js';
import facultyResearchAreaRoutes from './routes/facultyResearchAreas.js';
import facultySlotRoutes from './routes/facultySlots.js';
import researchAreaRoutes from './routes/researchAreas.js';
import studentInterestRoutes from './routes/studentInterests.js';
import recommendationRoutes from './routes/recommendations.js';
import supervisionRequestRoutes from './routes/supervisionRequests.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

// 1. Initialize app BEFORE any middleware or routes
const app = express();

// 2. CORS — allow live frontend + local dev + preflight OPTIONS
const allowedOrigins = [
  'https://recommendation-system-eosin.vercel.app',
  'https://recommendation-system-gkxe.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin(origin, cb) {
    // allow same-origin / serverless / curl requests with no origin
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, true); // permissive for now; tighten later if needed
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Info', 'Apikey'],
  credentials: true,
}));

// 3. Middleware
app.use(express.json({ limit: '10mb' }));

// 4. Ensure every serverless invocation has a live DB connection.
//    If the DB is unreachable, fail the request with 503 instead of
//    letting Mongoose buffer until the 10s timeout.
app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection error:', err.message);
    return res.status(503).json({
      error: 'Database is temporarily unavailable. Please try again in a moment.',
    });
  }
});

// 5. Routes
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

// Root test route
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Supervisor Recommendation API is running.' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Central error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

// Only listen if running locally (not as Vercel serverless export)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
