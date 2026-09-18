 import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);

// DIRECT CONNECTION STRING SEED ROUTE
app.get('/api/seed-db', async (req, res) => {
  try {
    // Apni `.env` file se MONGO_URI string check karke yahan paste karein agar alag hai
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://admin:bkuc123@cluster0.mongodb.net/recommendation_system?retryWrites=true&w=majority";

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 15000
      });
    }

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

app.get('/', (req, res) => {
  res.send('Recommendation System Backend API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;