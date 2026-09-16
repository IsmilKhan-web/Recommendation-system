import mongoose from 'mongoose';

const recommendationHistorySchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  search_topic: { type: String, required: true },
  recommended_supervisors: [{
    faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number },
    matched_keywords: { type: [String], default: [] },
  }],
}, { timestamps: true });

recommendationHistorySchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

export default mongoose.model('RecommendationHistory', recommendationHistorySchema);
