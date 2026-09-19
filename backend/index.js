 import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import recommendationRoutes from './routes/recommendations.js';
import authRoutes from './routes/auth.js';
// baaqi imports yahan honge...

dotenv.config();

// 1. Pehle 'app' ko initialize karein:
const app = express();

// 2. Middleware setup karein:
app.use(cors());
app.use(express.json());

// 3. Ab routes attach karein:
app.use('/api/auth', authRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/search', recommendationRoutes);

// Root test route
app.get('/', (req, res) => {
  res.send('API Server is running successfully.');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});