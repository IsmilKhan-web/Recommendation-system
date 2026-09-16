import mongoose from 'mongoose';

const facultySlotSchema = new mongoose.Schema({
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  total_slots: { type: Number, min: 0, default: 0 },
  taken_slots: { type: Number, min: 0, default: 0 },
  term: { type: String, default: 'Current Term' },
}, { timestamps: true });

facultySlotSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

export default mongoose.model('FacultySlot', facultySlotSchema);
