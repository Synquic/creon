import { Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profileImage?: string;
  role: 'admin' | 'manager';
  userType: 'parent' | 'sub';
  parentUserId?: string;
  createdBy?: string;
  isFirstLogin: boolean;
  isEmailVerified: boolean;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
    facebook?: string;
    linkedin?: string;
    website?: string;
  };
  theme: {
    background: string;
    textColor: string;
    buttonStyle: string;
  };
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILink extends Document {
  userId: string;
  title: string;
  url: string;
  shortCode: string;
  description?: string;
  image?: string;
  isActive: boolean;
  isWorking: boolean;
  lastTested?: Date;
  clickCount: number;
  order: number;
  type: 'link' | 'header' | 'social' | 'product_collection';
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct extends Document {
  userId: string;
  collectionId?: string;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  image: string;
  affiliateUrl: string;
  shortCode: string;
  clickCount: number;
  isActive: boolean;
  isWorking: boolean;
  lastTested?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductCollection extends Document {
  userId: string;
  title: string;
  description?: string;
  image?: string;
  products: string[];
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnalytics extends Document {
  userId: string;
  linkId?: string;
  productId?: string;
  type: 'link_click' | 'product_click' | 'profile_view';
  ipAddress: string;
  userAgent: string;
  referer?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  timestamp: Date;
}

export interface ISession extends Document {
  userId: string;
  token: string;
  deviceInfo?: string;
  ipAddress: string;
  expiresAt: Date;
  createdAt: Date;
}