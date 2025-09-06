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
exports.Product = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const productSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        ref: 'User'
    },
    collectionId: {
        type: String,
        ref: 'ProductCollection',
        default: null
    },
    title: {
        type: String,
        required: [true, 'Product title is required'],
        trim: true,
        maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    price: {
        type: Number,
        min: [0, 'Price cannot be negative']
    },
    currency: {
        type: String,
        default: 'USD',
        uppercase: true,
        maxlength: [3, 'Currency code must be 3 characters']
    },
    image: {
        type: String,
        required: [true, 'Product image is required']
    },
    affiliateUrl: {
        type: String,
        required: [true, 'Affiliate URL is required'],
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
    clickCount: {
        type: Number,
        default: 0,
        min: [0, 'Click count cannot be negative']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tags: [{
            type: String,
            trim: true,
            lowercase: true,
            maxlength: [30, 'Tag cannot exceed 30 characters']
        }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
productSchema.virtual('shortUrl').get(function () {
    return `/p/${this.shortCode}`;
});
productSchema.virtual('formattedPrice').get(function () {
    if (!this.price)
        return null;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: this.currency || 'USD'
    }).format(this.price);
});
productSchema.index({ userId: 1, collectionId: 1 });
productSchema.index({ shortCode: 1 });
productSchema.index({ userId: 1, isActive: 1 });
productSchema.index({ tags: 1 });
exports.Product = mongoose_1.default.model('Product', productSchema);
//# sourceMappingURL=Product.js.map