const express = require("express");
const router = express.Router();
const {createProduct, updateProduct, getAllProducts, getProductById, deleteProduct} = require("../controllers/productController");

const redis = require("redis");
const client = redis.createClient();
client.connect();

const cacheProduct = async (req, res, next) => {
  const id = req.params.id;
  try {
    const cached = await client.get(`product:${id}`);
    if (cached) {
      console.log("🧠 Redis'ten geldi");
      // Frontend'in beklediği success: true yapısını ekledik
      return res.json({
        success: true,
        message: "Ürün başarıyla getirildi (cache).",
        data: JSON.parse(cached)
      });
    }
    next();
  } catch (err) {
    console.error("Redis hatası:", err);
    next();
  }
};

const authMiddleware = require("../middleware/authMiddleware");
const uploadMiddleware = require('../middleware/uploadMiddleware')

// 1. HERKESE AÇIK ROTALAR (Giriş yapmadan erişilebilenler)
router.get("/list", getAllProducts);
router.get("/:id", cacheProduct, getProductById); // Bu satırı güvenlik duvarının üstüne taşıdık!

// --- GÜVENLİK DUVARI (Bundan sonrakiler için giriş şart) ---
router.use(authMiddleware);

// 2. SADECE YETKİLİ ROTALAR
router.post("/create", uploadMiddleware, createProduct);
router.put("/update", uploadMiddleware, updateProduct);
router.post("/delete", deleteProduct);

module.exports = router;