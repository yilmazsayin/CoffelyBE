const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const app = express();

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const ordersRoutes = require("./routes/orders");

// Auth middleware
const authMiddleware = require("./middleware/authMiddleware");

// MongoDB bağlantısını bir kereye mahsus yapmak için
let isConnected = false;
const connectToDatabase = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("✅ MongoDB bağlantısı başarılı!");
  } catch (err) {
    console.error("❌ MongoDB bağlantısı başarısız:", err.message);
  }
};

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "https://coffely-fe.vercel.app/",
    credentials: true,
  })
);
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/user", authMiddleware, userRoutes);
app.use("/api/orders", authMiddleware, ordersRoutes);
app.use("/api/product", productRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("API çalışıyor.");
});

// Vercel serverless export
module.exports = async (req, res) => {
  await connectToDatabase();
  return app(req, res);
};
