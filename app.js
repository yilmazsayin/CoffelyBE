const express = require("express");
const mongoose = require("mongoose");
const redis = require("redis");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const userRoutes = require("./routes/user");
const ordersRoutes = require("./routes/orders");

// Middleware
const authMiddleware = require("./middleware/authMiddleware");

app.use(express.json());
app.use(cors({
origin: ["http://localhost:5173", "https://coffely-fe.vercel.app"],  credentials: true,
}));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/user", authMiddleware, userRoutes);
app.use("/api/orders", authMiddleware, ordersRoutes);

app.get("/", (req, res) => {
  res.send("API çalışıyor.");
});

// Start Server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB bağlantısı başarılı!");
    app.listen(PORT, () => {
      console.log(`⚙️ Server ${PORT} portunda çalışıyor.`);
    });
  } catch (err) {
    console.error("❌ MongoDB bağlantısı başarısız.", err.message);
    process.exit(1);
  }
};
startServer();
