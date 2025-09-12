"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Theme = void 0;
const mongoose_1 = require("mongoose");
const themeSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
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
    hideBranding: {
        type: Boolean,
        default: false
    },
    customCss: {
        type: String,
        maxlength: 5000
    }
}, {
    timestamps: true,
});
exports.Theme = (0, mongoose_1.model)('Theme', themeSchema);
//# sourceMappingURL=Theme.js.map