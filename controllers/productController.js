const Product = require("../models/Product");
const Order = require("../models/Order");
const path = require("path");
const redis = require("redis");
const fs = require("fs");

// 🔌 Redis client bağlantısı
const client = redis.createClient();
client.connect()
  .then(() => console.log("Redis bağlantısı kuruldu"))
  .catch(err => console.error("Redis bağlantı hatası:", err));

// ✅ Ürün oluşturma
exports.createProduct = async (req, res) => {
  try {
    if (!req.cloudinaryResult || !req.cloudinaryResult.secure_url) {
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
      image: req.cloudinaryResult.secure_url,
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

// ✅ Ürün güncelleme
exports.updateProduct = async (req, res) => {
  try {
    const { id, name, price, description } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Ürün bulunamadı" });
    }

    if (req.cloudinaryResult && req.cloudinaryResult.secure_url) {
      product.image = req.cloudinaryResult.secure_url;
    }

    if (name) product.name = name;
    if (price) product.price = Number(price);
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

// ✅ Ürün silme
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

// ✅ Tüm ürünleri listeleme
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

// ✅ Ürün ID'si ile getirme (sadece buraya Redis cache entegre edildi)
exports.getProductById = async (req, res) => {
  const productId = req.params.id;
  const redisKey = `product:${productId}`;

  try {
    const cachedProduct = await client.get(redisKey);
    if (cachedProduct) {
      return res.json({
        message: "Ürün başarıyla getirildi (cache).",
        success: true,
        data: JSON.parse(cachedProduct),
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Ürün bulunamadı" });
    }

    await client.setEx(redisKey, 60, JSON.stringify(product));

    res.json({
      message: "Ürün başarıyla getirildi.",
      success: true,
      data: product,
    });

  } catch (err) {
    res.status(500).json({
      message: "Sunucu hatası",
      success: false,
      error: err.message,
    });
  }
};
