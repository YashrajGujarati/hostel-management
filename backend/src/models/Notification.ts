import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  studentId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'reminder';
  read: boolean;
}

const NotificationSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'reminder'], default: 'info' },
  read: { type: Boolean, default: false }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export default mongoose.model<INotification>('Notification', NotificationSchema);
