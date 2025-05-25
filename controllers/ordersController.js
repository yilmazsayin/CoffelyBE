const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  try {
    const { items, address, paymentInfo } = req.body;
    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Sipariş ürün listesi boş olamaz.", success: false });
    }
    const newOrder = new Order({
      user: req.userId,
      items,
      address,
      paymentInfo,
    });
    await newOrder.save();
    res.status(201).json({ message: "Sipariş başarıyla oluşturuldu", success: true });
  } catch (error) {
    console.error("Sipariş oluşturulurken hata:", error);
    res.status(500).json({ message: "Sipariş oluşturulamadı.", success: false });
  }
};

// Siparişleri listeleme (JSON cevabında statusCode ile birlikte)
exports.listOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({ user: userId })
    .populate("items.product")
    res.status(200).json({
      success: true,
      data: orders,
      message: "Siparişler başarıyla listelendi.",
    });
  } catch (error) {
    console.error("Siparişler listelenirken hata:", error);
    res.status(500).json({
      success: false,
      error: "Siparişler listelenemedi.",
    });
  }
};
