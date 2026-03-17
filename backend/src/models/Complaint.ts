import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaint extends Document {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  category: 'Staff' | 'Medical' | 'Maintenance' | 'Food' | 'Other';
  subject: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  adminResponse: string;
  createdAt: Date;
  resolvedAt?: Date;
}

const ComplaintSchema = new Schema<IComplaint>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: { type: String, required: true },
  category: {
    type: String,
    enum: ['Staff', 'Medical', 'Maintenance', 'Food', 'Other'],
    required: true
  },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  adminResponse: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null }
});

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema);
