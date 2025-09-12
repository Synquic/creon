import mongoose, { Schema, Document } from 'mongoose';

export interface IShopSettings extends Document {
  userId: string;
  isVisible: boolean;
  title: string;
  description?: string;
  isMainTab: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const shopSettingsSchema = new Schema<IShopSettings>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User',
    unique: true
  },
  isVisible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Shop',
    trim: true,
    maxlength: [50, 'Title cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  isMainTab: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});



export default mongoose.model<IShopSettings>('ShopSettings', shopSettingsSchema);
