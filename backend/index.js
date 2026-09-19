 import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const app = express();

// CORS Configuration
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
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', cors());
app.use(express.json());

// Safe Database Connection Helper
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  const mongoUri = process.env.MONGO_URI || "mongodb+srv://Ismailkhan:bkuc12345@cluster0.cmoiqi0.mongodb.net/Recommendation-system?retryWrites=true&w=majority";
  
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
};

// Middleware to ensure DB connection before handling API routes
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Seed Route
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