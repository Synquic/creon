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
exports.ProductCollection = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const productCollectionSchema = new mongoose_1.Schema({
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
productCollectionSchema.virtual('productCount').get(function () {
    return this.products?.length || 0;
});
productCollectionSchema.index({ userId: 1, order: 1 });
productCollectionSchema.index({ userId: 1, isActive: 1 });
exports.ProductCollection = mongoose_1.default.model('ProductCollection', productCollectionSchema);
//# sourceMappingURL=ProductCollection.js.map