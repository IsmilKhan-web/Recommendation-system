import mongoose from 'mongoose';

const authorizedUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  role: { type: String, enum: ['student','faculty','admin'], required: true },
}, { timestamps: true });

export default mongoose.model('AuthorizedUser', authorizedUserSchema);
