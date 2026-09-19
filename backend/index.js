 import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const app = express();

// 1. CORS Setup for Vercel
const allowedOrigins = [
  'https://recommendation-system-eosin.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback for public testing
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Pre-flight OPTIONS handling
app.options('*', cors());

app.use(express.json());

// MongoDB Connection Middleware for Vercel Serverless
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  const mongoUri = process.env.MONGO_URI || "mongodb+srv://Ismailkhan:mypassword123@cluster0.cmoiqi0.mongodb.net/Recommendation-system?retryWrites=true&w=majority";
  await mongoose.connect(mongoUri);
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database Connection Error:", err);
    res.status(500).json({ success: false, message: "Database connection error" });
  }
});

// Routes
app.use('/api/auth', authRoutes);

app.get('/api/seed-db', async (req, res) => {
  try {
    await seedDatabase();
    res.status(200).json({
      success: true,
      message: "Database seeded successfully with Admin and Faculty accounts!"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Seeding failed",
      error: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.send("API Server is running successfully.");
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;