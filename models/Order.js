const mongoose = require("mongoose");

  const OrderItemSchema = new mongoose.Schema({
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "En az bir ürün seçilmelidir"],
    },
  });

const PaymentInfoSchema = new mongoose.Schema(
  {
    cardNumber: {
      type: String,
      required: [true, "Kart numarası zorunludur"],
    },
    cvv: {
      type: String,
      required: [true, "CVV kodu zorunludur"]
    },
  },
);

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [OrderItemSchema],
    address: {
      type: String,
      required: [true, "Adres girilmesi zorunludur"]
    },
    paymentInfo: PaymentInfoSchema,
    createDate: {
      type: Date,
      default: new Date()
    },
  }
);

module.exports = mongoose.model("Order", OrderSchema);
