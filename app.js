const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser')

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Routes
const authRoutes = require("./routes/auth");
const productRoutes = require('./routes/product');
const userRoutes = require('./routes/user');
const ordersRoutes = require('./routes/orders');

// Auth middleware
const authMiddleware = require("./middleware/authMiddleware");

app.use(express.json());
app.use(cors({
  origin: "https://coffely-fe.vercel.app",
  credentials: true,
}))
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/user", authMiddleware, userRoutes);
app.use("/api/orders", authMiddleware, ordersRoutes);

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