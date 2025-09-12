import mongoose, { Schema } from "mongoose";
import { IProduct } from "../types";

const productSchema = new Schema<IProduct>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      ref: "User",
    },
    collectionId: {
      type: String,
      ref: "ProductCollection",
      default: null,
    },
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
      maxlength: [3, "Currency code must be 3 characters"],
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
    },
    affiliateUrl: {
      type: String,
      required: [true, "Affiliate URL is required"],
      trim: true,
      match: [/^https?:\/\/.+/, "Please enter a valid URL"],
    },
    shortCode: {
      type: String,
      required: [true, "Short code is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [4, "Short code must be at least 4 characters"],
      maxlength: [20, "Short code cannot exceed 20 characters"],
      match: [
        /^[a-zA-Z0-9_-]+$/,
        "Short code can only contain letters, numbers, hyphens, and underscores",
      ],
    },
    clickCount: {
      type: Number,
      default: 0,
      min: [0, "Click count cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [30, "Tag cannot exceed 30 characters"],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("shortUrl").get(function () {
  return `/p/${this.shortCode}`;
});

productSchema.virtual("formattedPrice").get(function () {
  if (!this.price) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: this.currency || "USD",
  }).format(this.price);
});

productSchema.index({ collectionId: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ tags: 1 });

export const Product = mongoose.model<IProduct>("Product", productSchema);
