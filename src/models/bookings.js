import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    cake: {
      type: mongoose.Types.ObjectId,
      ref: "cakes",
    },
    razorpay_payment_id: {
      type: String,
    },
    razorpay_order_id: {
      type: String,
    },
    razorpay_order_id: {
      type: String,
    },

    ceremonyType: {
      type: mongoose.Types.ObjectId,
      ref: "ceremonyType",
    },
    user: { type: String },
    number: {
      type: Number,
    },
    theater: {
      type: mongoose.Types.ObjectId,
      ref: "theater",
    },
  },
  { timestamps: true }
);

export default mongoose.model("booking", bookingSchema, "booking");
