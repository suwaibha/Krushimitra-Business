import Seller from "../models/Seller.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ $or: [{ email }, { mobile }] });
    if (existingSeller) {
      return res.status(400).json({ message: "Seller with this email or mobile already exists." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new seller
    const newSeller = new Seller({
      name,
      mobile,
      email,
      password: hashedPassword,
    });

    await newSeller.save();

    // Create token
    const token = jwt.sign({ id: newSeller._id }, process.env.JWT_SECRET || "fallbacksecret", {
      expiresIn: "1d",
    });

    res.status(201).json({
      message: "Seller registered successfully",
      token,
      seller: {
        id: newSeller._id,
        name: newSeller.name,
        email: newSeller.email,
        mobile: newSeller.mobile,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
};

export const signin = async (req, res) => {
  try {
    const { credential, password } = req.body;

    // Find seller by email or mobile
    const seller = await Seller.findOne({
      $or: [{ email: credential }, { mobile: credential }],
    });

    if (!seller) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET || "fallbacksecret", {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Signin successful",
      token,
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        mobile: seller.mobile,
      },
    });
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ message: "Server error during signin" });
  }
};
