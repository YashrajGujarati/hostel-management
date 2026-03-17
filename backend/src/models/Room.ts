import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  roomNumber: string;
  type: 'Single' | 'Double' | 'Triple';
  floor: number;
  price: number;
  isAvailable: boolean;
  amenities: string[];
  capacity: number;
  occupants: mongoose.Types.ObjectId[];
  description: string;
}

const RoomSchema = new Schema<IRoom>({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Single', 'Double', 'Triple'], required: true },
  floor: { type: Number, required: true },
  price: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  amenities: [{ type: String }],
  capacity: { type: Number, required: true },
  occupants: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  description: { type: String, default: '' }
});

export default mongoose.model<IRoom>('Room', RoomSchema);
