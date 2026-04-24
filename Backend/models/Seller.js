import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
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
    crops: [
      {
        name: { type: String, required: true },
        location: { type: String, required: true },
        price: { type: String, required: true },
        unit: { type: String, required: true },
        available: { type: String, required: true },
        rating: { type: Number, default: 0 },
        grade: { type: String, required: true },
        img: { type: String, required: true },
        gradeColor: { type: String, default: "#fff" },
        gradeBg: { type: String, default: "rgba(22,101,52,0.75)" },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Seller", sellerSchema);
