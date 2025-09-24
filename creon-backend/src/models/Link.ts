import mongoose, { Schema } from "mongoose";
import { ILink } from "../types";

const linkSchema = new Schema<ILink>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    url: {
      type: String,
      required: [true, "URL is required"],
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
    description: {
      type: String,
      trim: true,
      maxlength: [250, "Description cannot exceed 250 characters"],
    },
    image: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isWorking: {
      type: Boolean,
      default: true,
    },
    lastTested: {
      type: Date,
      default: null,
    },
    clickCount: {
      type: Number,
      default: 0,
      min: [0, "Click count cannot be negative"],
    },
    order: {
      type: Number,
      default: 0,
      min: [0, "Order cannot be negative"],
    },
    type: {
      type: String,
      enum: ["link", "header", "social", "product_collection"],
      default: "link",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

linkSchema.virtual("shortUrl").get(function () {
  return `/s/${this.shortCode}`;
});

linkSchema.index({ order: 1 });
linkSchema.index({ isActive: 1 });

export const Link = mongoose.model<ILink>("Link", linkSchema);
