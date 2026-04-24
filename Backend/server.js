import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from 'url';
import cors from "cors";
import dotenv from "dotenv";
import sellerAuthRoutes from "./routes/sellerAuthRoutes.js";
import buyerAuthRoutes from "./routes/buyerAuthRoutes.js";
import sellerDashboardRoutes from "./routes/sellerDashboardRoutes.js";
import buyerDashboardRoutes from "./routes/buyerDashboardRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/seller", sellerAuthRoutes);
app.use("/api/buyer", buyerAuthRoutes);
app.use("/api/seller/dashboard", sellerDashboardRoutes);
app.use("/api/buyer/dashboard", buyerDashboardRoutes);

app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});