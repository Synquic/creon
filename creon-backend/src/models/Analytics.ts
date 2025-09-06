import mongoose, { Schema } from 'mongoose';
import { IAnalytics } from '../types';

const analyticsSchema = new Schema<IAnalytics>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User'
  },
  linkId: {
    type: String,
    ref: 'Link',
    default: null
  },
  productId: {
    type: String,
    ref: 'Product',
    default: null
  },
  type: {
    type: String,
    enum: ['link_click', 'product_click', 'profile_view'],
    required: [true, 'Analytics type is required']
  },
  ipAddress: {
    type: String,
    required: [true, 'IP address is required']
  },
  userAgent: {
    type: String,
    required: [true, 'User agent is required']
  },
  referer: {
    type: String,
    default: null
  },
  country: {
    type: String,
    default: null
  },
  city: {
    type: String,
    default: null
  },
  device: {
    type: String,
    default: null
  },
  browser: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ linkId: 1, timestamp: -1 });
analyticsSchema.index({ productId: 1, timestamp: -1 });
analyticsSchema.index({ type: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1 });

export const Analytics = mongoose.model<IAnalytics>('Analytics', analyticsSchema);