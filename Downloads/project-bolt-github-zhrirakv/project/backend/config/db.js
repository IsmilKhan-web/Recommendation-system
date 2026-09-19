import mongoose from 'mongoose';

/**
 * Resolve the MongoDB connection string from either MONGO_URI or MONGODB_URI.
 * On Vercel/Render the env var is injected at deploy time; locally it comes
 * from backend/.env via dotenv.
 */
function getMongoUri() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri || typeof uri !== 'string' || uri.trim().length === 0) {
    return null;
  }
  return uri.trim();
}

// Cache the connection on the global object so Vercel serverless warm
// invocations reuse a single connection instead of opening new ones.
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

/**
 * Returns a ready-to-use Mongoose connection.
 * Reuses the cached connection on warm starts; creates one on cold starts.
 * Throws if no URI is configured so the caller can surface a 503.
 */
export async function connectDB() {
  const cache = global.mongoose;

  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  if (cache.conn && mongoose.connection.readyState !== 1) {
    // Stale connection from a recycled serverless instance — reset
    cache.conn = null;
    cache.promise = null;
  }

  const uri = getMongoUri();
  if (!uri) {
    throw new Error('MongoDB connection string is not configured. Set MONGO_URI or MONGODB_URI in your environment.');
  }

  if (!cache.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    };
    cache.promise = mongoose
      .connect(uri, opts)
      .then((m) => {
        console.log('MongoDB connected successfully.');
        return m.connection;
      })
      .catch((err) => {
        console.error('MongoDB connection failed:', err.message);
        cache.promise = null; // allow retry on next invocation
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

export default connectDB;
