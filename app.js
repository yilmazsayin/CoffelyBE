const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser')
const path = require("path");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const ordersRoutes = require('./routes/orders');

// Auth middleware
const authMiddleware = require("./middleware/authMiddleware");

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}))
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/auth", authRoutes);
app.use("/api/user", authMiddleware, userRoutes);
app.use("/api/orders", authMiddleware, ordersRoutes);
app.use("/api/product", productRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("API çalışıyor.");
});
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB bağlantısı başarılı!");
    app.listen(PORT, () => {
      console.log(`⚙️ Server ${PORT} portunda calisiyor.`);
    });
  } catch (err) {
    console.error("❌ MongoDB bağlantısı başarısız.", err.message);
    process.exit(1);
  }
};
startServer();