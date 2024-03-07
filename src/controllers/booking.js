import { asyncHandler } from "../utils/asyncHandler.js";
import errorResponse from "../utils/errorResponse.js";
import { razorpayInstance } from "../configs/razorpay.js";
import bookings from "../models/bookings.js";

export const bookingOrder = asyncHandler(async (req, res, next) => {
  const options = {
    amount: Number(1 * 100),
    currency: "INR",
  };
  const order = await razorpayInstance.orders.create(options);

  res.status(200).json({
    success: true,
    order,
  });
});

export const verifyOrder = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Database comes here

    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
  }

  res
    .status(201)
    .json({ status: true, message: "Theater booked successfully!!" });
});
