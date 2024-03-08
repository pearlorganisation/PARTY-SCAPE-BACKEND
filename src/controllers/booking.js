import { asyncHandler } from "../utils/asyncHandler.js";
import errorResponse from "../utils/errorResponse.js";
import crypto from "crypto";
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
  console.log(req?.body, "fst");
  console.log(req?.body.payload.payment.entity.notes, "second");
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;
  if (!isAuthentic) {
    return res.status(400).json({ status: 400, message: "Payment failed!!" });
  }

  let data = await bookings.create({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  res.redirect(`http://localhost:5173/bookedSuccessfull/${data?._id}`);
});

export const getSingleBooking = asyncHandler(async (req, res) => {
  const data = await bookings.findById(req?.params?.id);
  res.status(200).json({ status: true, data });
});
