const express = require("express");
const router = express.Router();
const {createProduct, updateProduct, getAllProducts, getProductById, deleteProduct} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const uploadMiddleware = require('../middleware/uploadMiddleware')

router.get("/list", getAllProducts);

router.use(authMiddleware);

router.post("/create", uploadMiddleware, createProduct);
router.put("/update", uploadMiddleware, updateProduct);
router.post("/delete", deleteProduct);
router.get("/:id", getProductById);

module.exports = router;
