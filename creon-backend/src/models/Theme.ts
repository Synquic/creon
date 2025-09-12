import { Schema, model, Document } from 'mongoose';

export interface ThemeDocument extends Document {
  userId: string;
  
  // Colors
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  accentColor: string;
  
  // Typography
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  fontWeight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  
  // Button Styles
  buttonStyle: 'rounded' | 'square' | 'pill';
  buttonShadow: boolean;
  buttonBorderWidth: number;
  buttonAnimation: 'none' | 'hover-lift' | 'hover-scale' | 'hover-glow';
  
  // Layout
  profileImageShape: 'circle' | 'square' | 'rounded-square';
  profileImageSize: 'small' | 'medium' | 'large';
  linkSpacing: 'compact' | 'normal' | 'relaxed';
  maxWidth: 'narrow' | 'normal' | 'wide';
  
  // Effects
  backgroundGradient: boolean;
  gradientDirection: 'vertical' | 'horizontal' | 'diagonal';
  backdropBlur: boolean;
  
  // Branding
  hideBranding: boolean;
  
  // Custom CSS
  customCss?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const themeSchema = new Schema<ThemeDocument>(
  {
    userId: {
      type: String,
      required: true,
      unique: true
    },
    
    // Colors
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    primaryColor: {
      type: String,
      default: '#16a34a'
    },
    secondaryColor: {
      type: String,
      default: '#15803d'
    },
    textColor: {
      type: String,
      default: '#1f2937'
    },
    accentColor: {
      type: String,
      default: '#3b82f6'
    },
    
    // Typography
    fontFamily: {
      type: String,
      default: 'Inter',
      enum: [
        'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
        'Poppins', 'Source Sans Pro', 'Nunito', 'Raleway', 'Ubuntu'
      ]
    },
    fontSize: {
      type: String,
      default: 'medium',
      enum: ['small', 'medium', 'large']
    },
    fontWeight: {
      type: String,
      default: 'normal',
      enum: ['light', 'normal', 'medium', 'semibold', 'bold']
    },
    
    // Button Styles
    buttonStyle: {
      type: String,
      default: 'rounded',
      enum: ['rounded', 'square', 'pill']
    },
    buttonShadow: {
      type: Boolean,
      default: true
    },
    buttonBorderWidth: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    buttonAnimation: {
      type: String,
      default: 'hover-scale',
      enum: ['none', 'hover-lift', 'hover-scale', 'hover-glow']
    },
    
    // Layout
    profileImageShape: {
      type: String,
      default: 'circle',
      enum: ['circle', 'square', 'rounded-square']
    },
    profileImageSize: {
      type: String,
      default: 'medium',
      enum: ['small', 'medium', 'large']
    },
    linkSpacing: {
      type: String,
      default: 'normal',
      enum: ['compact', 'normal', 'relaxed']
    },
    maxWidth: {
      type: String,
      default: 'normal',
      enum: ['narrow', 'normal', 'wide']
    },
    
    // Effects
    backgroundGradient: {
      type: Boolean,
      default: false
    },
    gradientDirection: {
      type: String,
      default: 'vertical',
      enum: ['vertical', 'horizontal', 'diagonal']
    },
    backdropBlur: {
      type: Boolean,
      default: false
    },
    
    // Branding
    hideBranding: {
      type: Boolean,
      default: false
    },
    
    // Custom CSS
    customCss: {
      type: String,
      maxlength: 5000
    }
  },
  {
    timestamps: true,
  }
);

export const Theme = model<ThemeDocument>('Theme', themeSchema);