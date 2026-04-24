import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await mongoose.connection.db.collection('offers').deleteMany({});
  await mongoose.connection.db.collection('buyers').updateMany({}, { $set: { totalSpent: 0, orders: [] } });
  console.log('Reset complete');
  process.exit(0);
});
