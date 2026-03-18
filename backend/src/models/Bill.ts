import mongoose, { Schema, Document } from 'mongoose';

export interface IBill extends Document {
  studentId: mongoose.Types.ObjectId;
  amount: number;
  roomCharges: number;
  foodCharges: number;
  laundryCharges: number;
  gstAmount: number;
  duration: number; // in months
  durationLabel: string;
  status: 'Paid' | 'Unpaid';
  paymentMethod: string;
  dueDate: Date;
  paidDate: Date | null;
}

const BillSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  roomCharges: { type: Number, required: true },
  foodCharges: { type: Number, required: true },
  laundryCharges: { type: Number, required: true },
  gstAmount: { type: Number, required: true },
  duration: { type: Number, required: true },
  durationLabel: { type: String, required: true },
  status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Unpaid' },
  paymentMethod: { type: String, default: '' },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date, default: null }
}, {
  timestamps: true
});

export default mongoose.model<IBill>('Bill', BillSchema);
