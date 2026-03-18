import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomNumber: string;
  type: string;
  floor: number;
  price: number;
  isAvailable: boolean;
  amenities: string[];
  capacity: number;
  description: string;
}

const RoomSchema: Schema = new Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  floor: { type: Number, required: true },
  price: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  amenities: { type: [String], default: [] },
  capacity: { type: Number, required: true },
  description: { type: String, default: '' }
}, {
  timestamps: true
});

export default mongoose.model<IRoom>('Room', RoomSchema);
