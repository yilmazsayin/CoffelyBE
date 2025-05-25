const express = require("express");
const router = express.Router();
const {createProduct, updateProduct, getAllProducts, getProductById, deleteProduct} = require("../controllers/productController");
const uploadAndResize = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");


router.get("/list", getAllProducts);

router.use(authMiddleware);

router.post("/create", uploadAndResize, createProduct);
router.put("/update", uploadAndResize, updateProduct);
router.post("/delete", deleteProduct);
router.get("/:id", getProductById);

module.exports = router;
