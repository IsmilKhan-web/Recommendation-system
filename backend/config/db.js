import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

const cached = global.mongoose;

if (!cached) {
  global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const cache = global.mongoose;
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };
    cache.promise = mongoose.connect(MONGO_URI, opts).then((m) => m.connection);
  }
  cache.conn = await cache.promise;
  return cache.conn;
}

export default connectDB;
