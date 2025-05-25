const express = require("express");
const router = express.Router();
const {listOrders, createOrder} = require("../controllers/ordersController");

router.get("/list", listOrders)
router.post("/create", createOrder);

module.exports = router;
