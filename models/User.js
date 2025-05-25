const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "İsim alanı zorunludur"],
      minlength: [3, "İsim en az 3 karakter olmalıdır"],
    },
    lastName: {
      type: String,
      required: [true, "Soyisim alanı zorunludur"],
      minlength: [3, "Soyisim en az 3 karakter olmalıdır"],
    },
    email: {
      type: String,
      required: [true, "E-posta alanı zorunludur"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Geçerli bir e-posta adresi giriniz"],
    },
    password: {
      type: String,
      required: [true, "Şifre alanı zorunludur"],
      minlength: [6, "Şifre en az 6 karakter olmalıdır"],
    },
    address: {
      type: String,
      required: [true, "Adres alanı zorunludur"],
      minlength: [3, "Adres en az 3 karakter olmalıdır"],
    },
    phone: {
      type: String,
      required: [true, "Telefon numarası zorunludur"],
      match: [
        /^(0?5\d{2}) ?\d{3} ?\d{2} ?\d{2}$/,
        "Geçerli bir telefon numarası giriniz, Örn: 0555 555 55 55, 555 555 55 55",
      ],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
