import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer'
  },
  buyerName: {
    type: String,
    required: true
  },
  initials: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: "#d1fae5"
  },
  textColor: {
    type: String,
    default: "#065f46"
  },
  detail: {
    type: String, // e.g. "Wheat (Punjab) • 120 qtl • 2h ago"
    required: true
  },
  priceOffered: {
    type: String, // e.g. "₹2,420/qtl"
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  razorpayPaymentId: { type: String, default: null },
  razorpayOrderId:   { type: String, default: null },
}, { timestamps: true });

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;
