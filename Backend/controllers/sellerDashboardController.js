import Seller from '../models/Seller.js';
import Offer from '../models/Offer.js';
import Buyer from '../models/Buyer.js';

export const getDashboardData = async (req, res) => {
  try {
    const seller = await Seller.findById(req.sellerId).select('-password');
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    const crops = seller.crops || [];
    const allOffers = await Offer.find({ seller: req.sellerId });
    const pendingOffers = allOffers.filter(o => o.status === 'pending');
    const paidOffers = allOffers.filter(o => o.status === 'accepted' && o.paymentStatus === 'paid');
    const paidCropIds = paidOffers.map(o => o.crop.toString());

    // Active Buyers: count of unique buyers who have made real offers
    const uniqueBuyers = new Set(allOffers.map(o => o.buyerName));
    const activeBuyersCount = uniqueBuyers.size;

    // Dynamic computations based on crops
    let totalRevenue = 0;
    let totalPrice = 0;
    let validPrices = 0;
    let location = "Not specified";

    if (crops.length > 0) {
      // Use the location of the most recently added crop
      location = crops[crops.length - 1].location;

      crops.forEach(c => {
        const p = parseInt(c.price.replace(/[^0-9]/g, '')) || 0;
        const q = parseInt(c.available.replace(/[^0-9]/g, '')) || 0;
        if (p > 0) {
          totalPrice += p;
          validPrices++;
        }
        totalRevenue += (p * q);
      });
    }

    const avgPriceVal = validPrices > 0 ? Math.round(totalPrice / validPrices) : 0;
    const avgPriceStr = avgPriceVal > 0 ? `₹${avgPriceVal.toLocaleString()}` : "₹0";
    
    let revenueEstimateStr = "₹0";
    if (totalRevenue > 100000) {
      revenueEstimateStr = `₹${(totalRevenue / 100000).toFixed(1)}L`;
    } else if (totalRevenue > 0) {
      revenueEstimateStr = `₹${totalRevenue.toLocaleString()}`;
    }

    const stats = {
      totalListings: crops.length,
      totalListingsBadge: `${crops.length} total`,
      activeBuyers: activeBuyersCount,
      activeBuyersBadge: activeBuyersCount > 0 ? `${activeBuyersCount} unique` : "No buyers yet",
      revenueEstimate: revenueEstimateStr,
      revenueEstimateBadge: totalRevenue > 0 ? `₹${totalRevenue.toLocaleString()} est.` : "No revenue yet",
      avgPrice: avgPriceStr,
      avgPriceBadge: crops.length > 0 ? `Across ${crops.length} crop${crops.length !== 1 ? 's' : ''}` : "No crops yet",
      newOffersCount: pendingOffers.length,
    };

    // Calculate actual sales data from paidOffers over the last 6 months
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const salesDataMap = {};
    
    const today = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mName = monthNames[d.getMonth()];
      months.push(mName);
      salesDataMap[mName] = 0;
    }

    paidOffers.forEach(offer => {
      const date = new Date(offer.updatedAt || offer.createdAt);
      const mName = monthNames[date.getMonth()];
      if (salesDataMap[mName] !== undefined) {
        const amount = parseInt((offer.priceOffered || '').replace(/[^0-9]/g, '')) || 0;
        salesDataMap[mName] += amount;
      }
    });

    const salesData = months.map(m => ({ month: m, revenue: salesDataMap[m] }));

    // Calculate dynamic MoM
    const currentMonthRev = salesData[5].revenue;
    const lastMonthRev = salesData[4].revenue;
    let momPercentage = 0;
    if (lastMonthRev > 0) {
      momPercentage = Math.round(((currentMonthRev - lastMonthRev) / lastMonthRev) * 100);
    } else if (currentMonthRev > 0) {
      momPercentage = 100;
    }
    
    stats.momString = momPercentage > 0 ? `+${momPercentage}% MoM` : `${momPercentage}% MoM`;
    stats.momIsPositive = momPercentage >= 0;

    res.json({
      seller: {
        name: seller.name,
        location,
        role: "Farmer"
      },
      stats,
      crops,
      offers: pendingOffers,
      paidCropIds,
      salesData
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const handleOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; 
    
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (offer.seller.toString() !== req.sellerId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    offer.status = action === 'accept' ? 'accepted' : 'declined';
    await offer.save();

    res.json({ message: `Offer ${action}ed successfully` });
  } catch (error) {
    console.error("Error handling offer:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOffersByCrop = async (req, res) => {
  try {
    const { cropId } = req.params;
    const offers = await Offer.find({ seller: req.sellerId, crop: cropId });
    const result = offers.map(o => ({
      _id: o._id,
      buyerName: o.buyerName,
      initials: o.initials,
      color: o.color,
      textColor: o.textColor,
      priceOffered: o.priceOffered,
      detail: o.detail,
      status: o.status,
      paymentStatus: o.paymentStatus || 'unpaid',
      createdAt: o.createdAt
    }));
    res.json(result);
  } catch (error) {
    console.error('Error fetching crop offers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name cannot be empty' });
    }
    const seller = await Seller.findByIdAndUpdate(
      req.sellerId,
      { name: name.trim() },
      { new: true, select: '-password' }
    );
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    res.json({ name: seller.name });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCrop = async (req, res) => {
  try {
    const { name, grade, quantity, unit, expectedPrice, state, district, notes, image } = req.body;
    
    // Process base64 image if exists
    let img = "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80"; // Default
    if (image) {
      img = image; // The base64 string
    } else {
      // Fallbacks if no image uploaded
      if (name && name.toLowerCase().includes('wheat')) img = "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&q=80";
      if (name && name.toLowerCase().includes('tomato')) img = "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=500&q=80";
    }

    let gradeColor = "#fff";
    let gradeBg = "rgba(22,101,52,0.75)"; // Green for Grade A
    if (grade === "Grade Premium") {
      gradeColor = "#78350f";
      gradeBg = "rgba(120,53,15,0.75)";
    }

    const seller = await Seller.findById(req.sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    const newCrop = {
      name,
      location: `${district}, ${state}`,
      price: `₹${expectedPrice}`,
      unit: `/${unit}`,
      available: `${quantity} ${unit}`,
      grade,
      img,
      gradeColor,
      gradeBg,
      rating: 0
    };

    seller.crops.push(newCrop);
    await seller.save();
    
    // Get the recently added crop with its generated _id
    const savedCrop = seller.crops[seller.crops.length - 1].toObject();
    savedCrop.seller = seller.name; // Attach seller name for UI

    res.status(201).json(savedCrop);
  } catch (error) {
    console.error("Error creating crop:", error);
    res.status(500).json({ message: 'Server error creating crop' });
  }
};

export const updateCrop = async (req, res) => {
  try {
    const { cropId } = req.params;
    const { name, grade, quantity, unit, expectedPrice, state, district, notes, image } = req.body;

    const seller = await Seller.findById(req.sellerId);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    const crop = seller.crops.id(cropId);
    if (!crop) return res.status(404).json({ message: 'Crop not found' });

    // Update image only if a new one is provided
    if (image) crop.img = image;

    // Update grade colours
    let gradeColor = "#fff";
    let gradeBg = "rgba(22,101,52,0.75)";
    if (grade === "Grade Premium") {
      gradeColor = "#78350f";
      gradeBg = "rgba(120,53,15,0.75)";
    } else if (grade === "Grade B") {
      gradeColor = "#fff";
      gradeBg = "rgba(120,53,15,0.6)";
    }

    crop.name     = name     || crop.name;
    crop.grade    = grade    || crop.grade;
    crop.location = `${district}, ${state}`;
    crop.price    = `₹${expectedPrice}`;
    crop.unit     = `/${unit}`;
    crop.available = `${quantity} ${unit}`;
    crop.gradeColor = gradeColor;
    crop.gradeBg    = gradeBg;
    if (notes !== undefined) crop.notes = notes;

    await seller.save();

    const updatedCrop = crop.toObject();
    updatedCrop.seller = seller.name;

    res.json(updatedCrop);
  } catch (error) {
    console.error("Error updating crop:", error);
    res.status(500).json({ message: 'Server error updating crop' });
  }
};
