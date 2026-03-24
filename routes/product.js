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
      return res.json(JSON.parse(cached));
    }
    next();
  } catch (err) {
    console.error("Redis hatası:", err);
    next();
  }
};

const authMiddleware = require("../middleware/authMiddleware");
const uploadMiddleware = require('../middleware/uploadMiddleware')

router.get("/list", getAllProducts);

router.use(authMiddleware);

router.post("/create", uploadMiddleware, createProduct);
router.put("/update", uploadMiddleware, updateProduct);
router.post("/delete", deleteProduct);
router.get("/:id", cacheProduct, getProductById);

module.exports = router;
