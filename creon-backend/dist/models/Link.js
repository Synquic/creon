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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Link = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const linkSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    url: {
        type: String,
        required: [true, 'URL is required'],
        trim: true,
        match: [/^https?:\/\/.+/, 'Please enter a valid URL']
    },
    shortCode: {
        type: String,
        required: [true, 'Short code is required'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [4, 'Short code must be at least 4 characters'],
        maxlength: [20, 'Short code cannot exceed 20 characters'],
        match: [/^[a-zA-Z0-9_-]+$/, 'Short code can only contain letters, numbers, hyphens, and underscores']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [250, 'Description cannot exceed 250 characters']
    },
    image: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isWorking: {
        type: Boolean,
        default: true
    },
    lastTested: {
        type: Date,
        default: null
    },
    clickCount: {
        type: Number,
        default: 0,
        min: [0, 'Click count cannot be negative']
    },
    order: {
        type: Number,
        default: 0,
        min: [0, 'Order cannot be negative']
    },
    type: {
        type: String,
        enum: ['link', 'header', 'social', 'product_collection'],
        default: 'link'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
linkSchema.virtual('shortUrl').get(function () {
    return `/s/${this.shortCode}`;
});
linkSchema.index({ order: 1 });
linkSchema.index({ isActive: 1 });
exports.Link = mongoose_1.default.model('Link', linkSchema);
//# sourceMappingURL=Link.js.map