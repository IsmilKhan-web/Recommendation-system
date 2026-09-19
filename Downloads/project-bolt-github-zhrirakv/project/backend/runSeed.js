import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is not set in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected successfully!');

    await seedDatabase();
    console.log('Seeding completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

run();
