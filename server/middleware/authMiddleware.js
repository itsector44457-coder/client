const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Check agar header mein 'Authorization: Bearer <token>' aaya hai
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; // Token nikal lo

      // Token verify karo
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "aarambh_secret_123",
      );

      // User ka data DB se nikal kar req object mein daal do (password chhod kar)
      req.user = await User.findById(decoded.id).select("-password");
      next(); // Sab sahi hai, agle function par jao
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
