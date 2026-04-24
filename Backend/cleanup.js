import mongoose from 'mongoose';
import Offer from './models/Offer.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    const offers = await Offer.find();
    
    // Group by buyerName + crop combination
    const seen = {};
    for (const offer of offers) {
      const key = `${offer.buyerName}-${offer.crop.toString()}`;
      if (seen[key]) {
        console.log('Deleting duplicate offer:', offer._id);
        await Offer.findByIdAndDelete(offer._id);
      } else {
        seen[key] = true;
      }
    }
    
    console.log('Cleanup complete');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
