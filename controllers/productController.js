const Product = require("../models/Product");
const Order = require("../models/Order");
const path = require("path");
const fs = require("fs");

exports.createProduct = async (req, res) => {
  try {
    if (!req.file || !req.file.filename) {
      return res
        .status(400)
        .json({ success: false, message: "Fotoğraf yüklenmeli" });
    }

    const { name, price, description } = req.body;

    if (!name || !price || !description) {
      return res
        .status(400)
        .json({ success: false, message: "Tüm alanlar zorunludur" });
    }

    const product = new Product({
      image: req.file.filename,
      name,
      price: Number(price),
      description,
    });

    await product.save();

    res
      .status(201)
      .json({ success: true, message: "Ürün başarıyla oluşturuldu", product });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Sunucu hatası", error: err.message });
  }
};

// Ürün güncelleme
exports.updateProduct = async (req, res) => {
  try {
    const { id, name, price, description } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Ürün bulunamadı" });
    }

    // Yeni fotoğraf yüklenmişse eskiyi silip yenisini koy
    if (req.file) {
      // Eski fotoğrafı sil
      const oldPath = path.join(__dirname, "..", "uploads", product.image);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      product.image = req.file.filename;
    }

    if (name) product.name = name;
    if (price) product.price = price;
    if (description) product.description = description;

    await product.save();
    res.json({
      success: true,
      message: "Ürün başarıyla güncellendi",
      data: product,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Sunucu hatası", error: err.message });
  }
};

// Ürün silme
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.body.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Ürün bulunamadı" });
    }
    const filePath = path.join(__dirname, "..", "uploads", product.image);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await Order.updateMany(
      { "items.product": productId },
      { $pull: { items: { product: productId } } }
    );
    await Order.deleteMany({ items: { $size: 0 } });
    await Product.deleteOne({ _id: productId });
    res.json({
      success: true,
      message: "Ürün ve boş siparişler başarıyla silindi",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: err.message,
    });
  }
};

// Tüm ürünleri listeleme
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ code: 200, success: true, data: products });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: err.message,
    });
  }
};

// Tek ürün detayı
exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Ürün bulunamadı" });
    }
    res.json({
      message: "Ürün başarıyla getirildi.",
      success: true,
      data: product,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Sunucu hatası", success: false, error: err.message });
  }
};
