import mongoose, { Document, Schema } from 'mongoose';

export interface IMeal {
  morning: string;
  afternoon: string;
  night: string;
}

export interface IFoodMenu extends Document {
  day: string;
  meals: IMeal;
}

const FoodMenuSchema = new Schema<IFoodMenu>({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
    unique: true
  },
  meals: {
    morning: { type: String, required: true },
    afternoon: { type: String, required: true },
    night: { type: String, required: true }
  }
});

export default mongoose.model<IFoodMenu>('FoodMenu', FoodMenuSchema);
