const express = require("express");
const router = express.Router();
const {createProduct, updateProduct, getAllProducts, getProductById, deleteProduct} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const uploadMiddleware = require('../middleware/uploadMiddleware');

// 1. HERKESE AÇIK ROTALAR (Sepet ve listeleme için)
router.get("/list", getAllProducts);
router.get("/:id", getProductById); 

// --- GÜVENLİK DUVARI (Bundan sonrakiler admin yetkisi/giriş ister) ---
router.use(authMiddleware);

// 2. SADECE YETKİLİ ROTALAR
router.post("/create", uploadMiddleware, createProduct);
router.put("/update", uploadMiddleware, updateProduct);
router.post("/delete", deleteProduct);

module.exports = router;