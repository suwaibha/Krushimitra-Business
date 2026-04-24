import express from 'express';
import { getDashboardData, handleOffer, createCrop, updateCrop, updateProfile, getOffersByCrop } from '../controllers/sellerDashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getDashboardData);
router.put('/profile', protect, updateProfile);
router.post('/offer/:id', protect, handleOffer);
router.post('/crop', protect, createCrop);
router.put('/crop/:cropId', protect, updateCrop);
router.get('/crop/:cropId/offers', protect, getOffersByCrop);

export default router;
