import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    cake: {
      type: mongoose.Types.ObjectId,
      ref: "cake",
    },
    addOns: {
      type: [],
    },
    totalPeople: {
      type: String,
    },
    bookedDate: {
      type: String,
      required: ["Booking date is required!!"],
    },
    bookedSlot: {
      type: String,
      required: ["Booked slot is required!!"],
    },
    isBookedSuccessfully: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: true,
    },

    razorpay_payment_id: {
      type: String,
    },
    razorpay_order_id: {
      type: String,
    },
    razorpay_payment_id: {
      type: String,
    },

    ceremonyType: {
      type: mongoose.Types.ObjectId,
      ref: "ceremonyType",
    },
    bookedBy: {
      name: String,
      email: String,
      whatsappNumber: String,
    },
    ceremonyTypeLabels: {
      type: [],
    },

    theater: {
      type: mongoose.Types.ObjectId,
      ref: "theater",
    },
    remainingPrice: {
      type: Number,
      // required: [true, "Remaining price is required!!"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("booking", bookingSchema, "booking");
