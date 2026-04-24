import Buyer from "../models/Buyer.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;

    // Check if buyer already exists
    const existingBuyer = await Buyer.findOne({ $or: [{ email }, { mobile }] });
    if (existingBuyer) {
      return res.status(400).json({ message: "Buyer with this email or mobile already exists." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new buyer
    const newBuyer = new Buyer({
      name,
      mobile,
      email,
      password: hashedPassword,
    });

    await newBuyer.save();

    // Create token
    const token = jwt.sign({ id: newBuyer._id }, process.env.JWT_SECRET || "fallbacksecret", {
      expiresIn: "1d",
    });

    res.status(201).json({
      message: "Buyer registered successfully",
      token,
      buyer: {
        id: newBuyer._id,
        name: newBuyer.name,
        email: newBuyer.email,
        mobile: newBuyer.mobile,
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

    // Find buyer by email or mobile
    const buyer = await Buyer.findOne({
      $or: [{ email: credential }, { mobile: credential }],
    });

    if (!buyer) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, buyer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign({ id: buyer._id }, process.env.JWT_SECRET || "fallbacksecret", {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Signin successful",
      token,
      buyer: {
        id: buyer._id,
        name: buyer.name,
        email: buyer.email,
        mobile: buyer.mobile,
      },
    });
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ message: "Server error during signin" });
  }
};
