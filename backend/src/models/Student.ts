import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IStudent extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  roomId: mongoose.Types.ObjectId | null;
  bookingStatus: 'None' | 'Pending' | 'Approved' | 'Rejected';
  profilePhoto: string | null;
  theme: 'dark' | 'light';
  role: 'student' | 'admin';
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const StudentSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', default: null },
  bookingStatus: { type: String, enum: ['None', 'Pending', 'Approved', 'Rejected'], default: 'None' },
  profilePhoto: { type: String, default: null },
  theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, {
  timestamps: true
});

// Hash password before saving
StudentSchema.pre<IStudent>('save', async function() {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err: any) {
    throw err;
  }
});

// Compare password method
StudentSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IStudent>('Student', StudentSchema);
