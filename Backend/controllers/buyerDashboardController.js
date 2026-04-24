import Buyer from '../models/Buyer.js';
import Seller from '../models/Seller.js';
import Offer from '../models/Offer.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export const getProfile = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.sellerId).select('-password');
    if (!buyer) return res.status(404).json({ message: 'Buyer not found' });
    res.json({ name: buyer.name, email: buyer.email, mobile: buyer.mobile });
  } catch (error) {
    console.error('Error fetching buyer profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name cannot be empty' });
    }
    const buyer = await Buyer.findByIdAndUpdate(
      req.sellerId,
      { name: name.trim() },
      { new: true, select: '-password' }
    );
    if (!buyer) return res.status(404).json({ message: 'Buyer not found' });
    res.json({ name: buyer.name });
  } catch (error) {
    console.error('Error updating buyer profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCrops = async (req, res) => {
  try {
    // Find all crop IDs that have been fully paid for
    const paidOffers = await Offer.find({ status: 'accepted', paymentStatus: 'paid' }).select('crop buyer');
    
    // We want to hide these crops from the marketplace, BUT keep them visible for the buyer who actually paid for them
    const hiddenCropIds = new Set(
      paidOffers
        .filter(o => o.buyer.toString() !== req.sellerId)
        .map(o => o.crop.toString())
    );

    // Fetch all sellers with their crops
    const sellers = await Seller.find({}).select('name crops');

    // Flatten into a single array with farmer name attached
    const allCrops = [];
    sellers.forEach(seller => {
      (seller.crops || []).forEach(crop => {
        // Skip crops that have already been paid for by *other* buyers
        if (hiddenCropIds.has(crop._id.toString())) return;

        // Parse numeric price for filtering
        const priceNum = parseInt((crop.price || '').replace(/[^0-9]/g, '')) || 0;
        // Normalize grade: strip "Grade " prefix if present
        const grade = (crop.grade || '').replace(/^Grade\s*/i, '').trim() || 'A';

        allCrops.push({
          _id: crop._id,
          sellerId: seller._id,
          name: crop.name,
          farmer: seller.name,
          location: crop.location,
          priceStr: crop.price,
          price: priceNum,
          unit: crop.unit || '',
          available: crop.available,
          rating: crop.rating || 0,
          grade,
          img: crop.img,
        });
      });
    });

    res.json(allCrops);
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStats = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.sellerId);
    if (!buyer) return res.status(404).json({ message: 'Buyer not found' });
    
    // Format total spent (e.g. 1240000 -> "12.4L")
    const formatCurrency = (num) => {
      if (num >= 100000) return '₹' + (num / 100000).toFixed(1) + 'L';
      if (num >= 1000) return '₹' + (num / 1000).toFixed(1) + 'K';
      return '₹' + num;
    };

    const offers = await Offer.find({ buyer: req.sellerId });
    // Map of cropId -> { status, offerId, paymentStatus }  so buyer UI can react to each status
    const offersMap = {};
    offers.forEach(o => {
      offersMap[o.crop.toString()] = {
        status: o.status,
        offerId: o._id.toString(),
        paymentStatus: o.paymentStatus || 'unpaid'
      };
    });
    // Keep backward-compat array for wishlist-style checks
    const offersSent = offers.map(o => o.crop.toString());

    const stats = {
      activeOrders: buyer.orders?.filter(o => o.status === 'active').length || 0,
      wishlistCount: buyer.wishlist?.length || 0,
      wishlist: buyer.wishlist || [],
      offersSent,
      offersMap,
      delivered: buyer.orders?.filter(o => o.status === 'delivered').length || 0,
      totalSpent: formatCurrency(buyer.totalSpent || 0)
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching buyer stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleWishlist = async (req, res) => {
  try {
    const { cropId } = req.body;
    if (!cropId) return res.status(400).json({ message: 'Crop ID is required' });

    const buyer = await Buyer.findById(req.sellerId);
    if (!buyer) return res.status(404).json({ message: 'Buyer not found' });

    // Ensure wishlist array exists
    if (!buyer.wishlist) buyer.wishlist = [];

    const index = buyer.wishlist.indexOf(cropId);
    let isWishlisted = false;

    if (index === -1) {
      // Add to wishlist
      buyer.wishlist.push(cropId);
      isWishlisted = true;
    } else {
      // Remove from wishlist
      buyer.wishlist.splice(index, 1);
    }

    await buyer.save();

    res.json({ 
      message: isWishlisted ? 'Added to wishlist' : 'Removed from wishlist',
      isWishlisted,
      wishlistCount: buyer.wishlist.length 
    });
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createRazorpayOrder = async (req, res) => {
  try {
    const { offerId } = req.body;
    if (!offerId) return res.status(400).json({ message: 'Offer ID is required' });

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    if (offer.buyer.toString() !== req.sellerId) return res.status(401).json({ message: 'Not authorized' });
    if (offer.status !== 'accepted') return res.status(400).json({ message: 'Offer has not been accepted yet' });
    if (offer.paymentStatus === 'paid') return res.status(400).json({ message: 'Already paid' });

    // Parse amount from priceOffered string e.g. "₹1000/kg" → 1000
    const amountNum = parseInt((offer.priceOffered || '').replace(/[^0-9]/g, '')) || 0;
    if (amountNum <= 0) return res.status(400).json({ message: 'Invalid offer price' });

    // Initialize Razorpay here so process.env is fully loaded
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: amountNum * 100, // Razorpay expects paise (1 INR = 100 paise)
      currency: 'INR',
      receipt: `offer_${offerId}`,
      notes: { offerId: offerId.toString() }
    });

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Server error creating payment order' });
  }
};

export const payForOffer = async (req, res) => {
  try {
    const { offerId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    if (!offerId) return res.status(400).json({ message: 'Offer ID is required' });
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification details' });
    }

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed — invalid signature' });
    }

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    if (offer.buyer.toString() !== req.sellerId) return res.status(401).json({ message: 'Not authorized' });
    if (offer.status !== 'accepted') return res.status(400).json({ message: 'Offer has not been accepted yet' });
    if (offer.paymentStatus === 'paid') return res.status(400).json({ message: 'Already paid' });

    offer.paymentStatus = 'paid';
    offer.razorpayPaymentId = razorpay_payment_id;
    offer.razorpayOrderId = razorpay_order_id;
    await offer.save();

    // Update the Buyer's document dynamically
    const buyer = await Buyer.findById(req.sellerId);
    if (buyer) {
      const amountNum = parseInt((offer.priceOffered || '').replace(/[^0-9]/g, '')) || 0;
      buyer.totalSpent = (buyer.totalSpent || 0) + amountNum;
      
      if (!buyer.orders) buyer.orders = [];
      buyer.orders.push({
        cropId: offer.crop,
        status: 'active',
        price: amountNum,
      });
      
      await buyer.save();
    }

    res.json({ message: 'Payment verified and recorded successfully', offerId: offer._id });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createOffer = async (req, res) => {
  try {
    const { cropId, sellerId, priceOffered } = req.body;
    if (!cropId || !sellerId || !priceOffered) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const buyer = await Buyer.findById(req.sellerId);
    if (!buyer) return res.status(404).json({ message: 'Buyer not found' });

    const seller = await Seller.findById(sellerId);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    const crop = seller.crops.id(cropId);
    if (!crop) return res.status(404).json({ message: 'Crop not found in seller' });

    // Prevent duplicate offers
    const existingOffer = await Offer.findOne({ buyer: buyer._id, crop: cropId });
    if (existingOffer) {
      return res.status(400).json({ message: 'You have already sent an offer for this crop.' });
    }

    const initials = buyer.name.substring(0, 2).toUpperCase();
    const colors = ["#d1fae5", "#fee2e2", "#e0e7ff", "#fef3c7"];
    const textColors = ["#065f46", "#991b1b", "#3730a3", "#92400e"];
    const rand = Math.floor(Math.random() * colors.length);

    const detailStr = `${crop.name} (${(crop.location || '').split(',')[0].trim()}) • ${crop.available} • Just now`;

    const offer = new Offer({
      seller: sellerId,
      crop: cropId,
      buyer: buyer._id,
      buyerName: buyer.name,
      initials,
      color: colors[rand],
      textColor: textColors[rand],
      detail: detailStr,
      priceOffered: priceOffered,
      status: 'pending'
    });

    await offer.save();

    res.json({ message: 'Offer sent successfully' });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
