import mongoose, { Schema, Document } from 'mongoose';

export interface IFoodMenu extends Document {
  day: string;
  morning: string;
  afternoon: string;
  night: string;
}

const FoodMenuSchema: Schema = new Schema({
  day: { type: String, required: true, unique: true },
  morning: { type: String, required: true },
  afternoon: { type: String, required: true },
  night: { type: String, required: true }
}, {
  timestamps: false
});

export default mongoose.model<IFoodMenu>('FoodMenu', FoodMenuSchema);
