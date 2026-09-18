 import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('MongoDB connection error:', err));
}

// Routes
app.use('/api/auth', authRoutes);

// LIVE DATABASE SEED ENDPOINT (Browser Se Execute Karne Ke Liye)
app.get('/api/seed-db', async (req, res) => {
  try {
    await seedDatabase();
    res.status(200).json({ 
      success: true, 
      message: "Database seeded successfully with Admin and Faculty accounts!" 
    });
  } catch (error) {
    console.error("Seeding Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.send('Recommendation System Backend API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;