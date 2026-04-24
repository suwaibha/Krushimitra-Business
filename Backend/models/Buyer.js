import mongoose from "mongoose";

const buyerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop'
    }],
    orders: [{
      cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
      status: { type: String, enum: ['active', 'delivered', 'cancelled'], default: 'active' },
      price: Number,
      quantity: Number,
      date: { type: Date, default: Date.now }
    }],
    totalSpent: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Buyer", buyerSchema);
