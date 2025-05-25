const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, "Fotoğraf alanı zorunludur"],
    },
    name: {
      type: String,
      required: [true, "Ürün adı zorunludur"],
      minlength: [3, "Ürün adı en az 3 karakter olmalıdır"],
    },
    price: {
      type: Number,
      required: [true, "Fiyat zorunludur"],
      min: [0, "Fiyat negatif olamaz"],
    },
    description: {
      type: String,
      required: [true, "Açıklama zorunludur"],
      minlength: [5, "Açıklama en az 5 karakter olmalıdır"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
