import { Document } from 'mongoose';
export interface ThemeDocument extends Document {
    userId: string;
    backgroundColor: string;
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    accentColor: string;
    fontFamily: string;
    fontSize: 'small' | 'medium' | 'large';
    fontWeight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
    buttonStyle: 'rounded' | 'square' | 'pill';
    buttonShadow: boolean;
    buttonBorderWidth: number;
    buttonAnimation: 'none' | 'hover-lift' | 'hover-scale' | 'hover-glow';
    profileImageShape: 'circle' | 'square' | 'rounded-square';
    profileImageSize: 'small' | 'medium' | 'large';
    linkSpacing: 'compact' | 'normal' | 'relaxed';
    maxWidth: 'narrow' | 'normal' | 'wide';
    backgroundGradient: boolean;
    gradientDirection: 'vertical' | 'horizontal' | 'diagonal';
    backdropBlur: boolean;
    hideBranding: boolean;
    customCss?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Theme: import("mongoose").Model<ThemeDocument, {}, {}, {}, Document<unknown, {}, ThemeDocument, {}, {}> & ThemeDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Theme.d.ts.map