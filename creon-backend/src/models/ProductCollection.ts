import mongoose, { Schema } from 'mongoose';
import { IProductCollection } from '../types';

const productCollectionSchema = new Schema<IProductCollection>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Collection title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  image: {
    type: String,
    default: null
  },
  products: [{
    type: String,
    ref: 'Product'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0,
    min: [0, 'Order cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productCollectionSchema.virtual('productCount').get(function() {
  return this.products?.length || 0;
});

productCollectionSchema.index({ order: 1 });
productCollectionSchema.index({ isActive: 1 });

export const ProductCollection = mongoose.model<IProductCollection>('ProductCollection', productCollectionSchema);