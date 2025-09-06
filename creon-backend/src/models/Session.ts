import mongoose, { Schema } from 'mongoose';
import { ISession } from '../types';

const sessionSchema = new Schema<ISession>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User'
  },
  token: {
    type: String,
    required: [true, 'Token is required'],
    unique: true
  },
  deviceInfo: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    required: [true, 'IP address is required']
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiry date is required']
  }
}, {
  timestamps: true
});

sessionSchema.index({ userId: 1 });
sessionSchema.index({ token: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model<ISession>('Session', sessionSchema);