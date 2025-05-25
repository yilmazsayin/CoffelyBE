const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/profile", userController.getUserInfo);
router.delete("/delete", userController.deleteUser);

module.exports = router;
