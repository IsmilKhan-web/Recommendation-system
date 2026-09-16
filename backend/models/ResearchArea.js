import mongoose from 'mongoose';

const researchAreaSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: { type: String, default: '' },
  description: { type: String, default: '' },
}, { timestamps: true });

researchAreaSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

export default mongoose.model('ResearchArea', researchAreaSchema);
