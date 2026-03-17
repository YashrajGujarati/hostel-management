import mongoose, { Document, Schema } from 'mongoose';

export interface IBill extends Document {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  roomNumber: string;
  roomType: string;
  roomCharges: number;
  foodCharges: number;
  laundryCharges: number;
  gstAmount: number;
  totalAmount: number;
  duration: number; // months
  durationLabel: string;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid';
  generatedAt: Date;
  paidAt?: Date;
}

const BillSchema = new Schema<IBill>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: { type: String, required: true },
  roomNumber: { type: String, required: true },
  roomType: { type: String, required: true },
  roomCharges: { type: Number, required: true },
  foodCharges: { type: Number, required: true },
  laundryCharges: { type: Number, required: true },
  gstAmount: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, required: true },
  duration: { type: Number, required: true },
  durationLabel: { type: String, required: true },
  paymentMethod: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  generatedAt: { type: Date, default: Date.now },
  paidAt: { type: Date, default: null }
});

export default mongoose.model<IBill>('Bill', BillSchema);
