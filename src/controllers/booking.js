import { asyncHandler } from "../utils/asyncHandler.js";
import errorResponse from "../utils/errorResponse.js";
import crypto from "crypto";
import { razorpayInstance } from "../configs/razorpay.js";
import bookings from "../models/bookings.js";
import { userBooking } from "../utils/nodemailer.js";

export const bookingOrder = asyncHandler(async (req, res, next) => {
  console.log(req?.body, "datattatatat");
  const options = {
    amount: Number(1 * 100),
    currency: "INR",
  };

  const newBooking = await bookings.create({
    ceremonyType: req?.body?.data?.selectedCeremony?._id,
    addOns: req?.body?.data?.selectedAddOns,
    theater: req?.body?.data?.theaterId,
    bookedBy: req?.body?.userDetail?.bookedBy,
    cake: req?.body?.data?.selectedCake?._id,

    bookedSlot: req?.body?.data?.slot,
    remainingPrice: Number(req?.body?.data?.theaterPrice) - 700,

    totalPeople: req?.body?.data?.NoOfPeople,
    bookedDate: req?.body?.data?.date,
  });

  const order = await razorpayInstance.orders.create(options);

  res.status(200).json({
    success: true,
    order,
    bookingId: newBooking?._id,
  });
});

export const verifyOrder = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  await bookings.findByIdAndUpdate(req?.params?.id, {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_payment_id,
  });

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;
  if (!isAuthentic) {
    return res.status(400).json({ status: 400, message: "Payment failed!!" });
  }
  const data = await bookings
    .findById(req?.params?.id)
    .populate("cake", ["name"])
    .populate("ceremonyType", ["type"])
    .populate("theater", ["theaterName"]);

  userBooking(data).then(async () => {
    await res.redirect(
      `${process.env.FRONTEND_LIVE_URL}/paymentSuccess/${data?._id}`
    );
  });
});

export const getSingleBooking = asyncHandler(async (req, res) => {
  const data = await bookings.findById(req?.params?.id);
  res.status(200).json({ status: true, data });
});
