import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaint extends Document {
  studentId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  status: 'Open' | 'Resolved' | 'Closed';
  comment: string;
}

const ComplaintSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['Open', 'Resolved', 'Closed'], default: 'Open' },
  comment: { type: String, default: '' }
}, {
  timestamps: true
});

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema);
