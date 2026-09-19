import mongoose from 'mongoose';

const supervisionRequestSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student_email: { type: String, required: true, trim: true },
  student_details: {
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String, default: '' },
  },
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project_mode: { type: String, enum: ['Solo', 'Group'], required: true },
  project_title: { type: String, default: '', trim: true },
  group_members: { type: [String], default: [] },
  project_proposal: { type: String, required: true, trim: true },
  status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
}, { timestamps: true });

supervisionRequestSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

export default mongoose.model('SupervisionRequest', supervisionRequestSchema);
