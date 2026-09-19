import mongoose from 'mongoose';

const studentResearchInterestSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  research_area_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ResearchArea', required: true },
  weight: { type: Number, min: 1, max: 5, default: 1 },
}, { timestamps: true });

studentResearchInterestSchema.index({ student_id: 1, research_area_id: 1 }, { unique: true });

studentResearchInterestSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

export default mongoose.model('StudentResearchInterest', studentResearchInterestSchema);
