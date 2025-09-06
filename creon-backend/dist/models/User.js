"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const socialLinksSchema = new mongoose_1.Schema({
    instagram: { type: String },
    twitter: { type: String },
    youtube: { type: String },
    tiktok: { type: String },
    facebook: { type: String },
    linkedin: { type: String },
    website: { type: String }
}, { _id: false });
const themeSchema = new mongoose_1.Schema({
    background: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#000000' },
    buttonStyle: { type: String, default: 'rounded' }
}, { _id: false });
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [20, 'Username cannot exceed 20 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    firstName: {
        type: String,
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    profileImage: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'manager', 'viewer', 'user'],
        default: 'user'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    socialLinks: {
        type: socialLinksSchema,
        default: {}
    },
    theme: {
        type: themeSchema,
        default: {}
    },
    isPremium: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
userSchema.virtual('fullName').get(function () {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});
userSchema.virtual('profileUrl').get(function () {
    return `/${this.username}`;
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    const salt = await bcryptjs_1.default.genSalt(12);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
    next();
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
exports.User = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=User.js.map