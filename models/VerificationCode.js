const mongoose = require("mongoose");

const VerificationCodeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "E-posta eklenmesi zorunludur."],
      match: [/^\S+@\S+\.\S+$/, "Geçerli bir e-posta formatı."],
    },
    code: {
      type: String,
      required: [true, "Doğrulama kodu zorunludur."],
      minlength: [6, "Doğrulama kodu 6 haneli olmalıdır."],
    },
    expiresAt: {
      type: Date,
      required: [true, "Doğrulama kodu geçerlilik süresi zorunludur."],
    },
    type: {
      type: String,
      enum: ["register", "resetPassword"],
      required: [true, "Doğrulama kodu tipi zorunludur."],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VerificationCode", VerificationCodeSchema);
