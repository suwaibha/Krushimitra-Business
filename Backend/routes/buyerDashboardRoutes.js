import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getProfile, updateProfile, getCrops, getStats, toggleWishlist, createOffer, payForOffer, createRazorpayOrder } from '../controllers/buyerDashboardController.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/crops', protect, getCrops);
router.get('/stats', protect, getStats);
router.post('/wishlist', protect, toggleWishlist);
router.post('/offer', protect, createOffer);
router.post('/create-order', protect, createRazorpayOrder);
router.post('/pay', protect, payForOffer);

export default router;


