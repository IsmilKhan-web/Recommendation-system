import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedDatabase } from './seed.js';

dotenv.config();

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://Ismailkhan:bkuc12345@cluster0.cmoiqi0.mongodb.net/Recommendation-system?retryWrites=true&w=majority";
    
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully!");

    await seedDatabase();
    console.log("Seeding completed successfully!");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

run();