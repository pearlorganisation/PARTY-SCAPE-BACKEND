import { asyncHandler } from "../utils/asyncHandler.js";
import errorResponse from "../utils/errorResponse.js";
import crypto from "crypto";
import { razorpayInstance } from "../configs/razorpay.js";
import bookings from "../models/bookings.js";
import { userBooking } from "../utils/nodemailer.js";
import { userBookingAdmin } from "../utils/forAdmin.js";
import { error } from "console";

export const bookingOrder = asyncHandler(async (req, res, next) => {
  let remainingPrice = Number(req?.body?.data?.theaterPrice) - 700;
  const newBooking = await bookings.create({
    ceremonyType: req?.body?.data?.selectedCeremony?._id,
    addOns: req?.body?.data?.selectedAddOns,
    theater: req?.body?.data?.theaterId,
    bookedBy: req?.body?.userDetail?.bookedBy,
    cake: req?.body?.data?.selectedCake?._id,
    ceremonyTypeLabels: req?.body?.data?.selectedCeremonyLabels,

    bookedSlot: req?.body?.data?.slot,
    remainingPrice,
    totalPeople: req?.body?.data?.NoOfPeople,
    bookedDate: req?.body?.data?.date,
  });
  const options = {
    amount: Number(750 * 100),
    currency: "INR",
  };

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
    res.redirect(`${process.env.FRONTEND_LIVE_URL}/paymentFailed/`);
  }
  const data = await bookings
    .findById(req?.params?.id)
    .populate("cake", ["name"])
    .populate("ceremonyType", ["type"])
    .populate("theater", ["theaterName"]);

  userBooking(data)
    .then(() => {
      userBookingAdmin(data).then((datatatatta) => {
        res.redirect(`${process.env.FRONTEND_LIVE_URL}/paymentSuccess`);
      });
    })
    .catch((e) => {
      return res
        .status(400)
        .json({ status: true, message: e?.message || "Internal server error" });
    });
});

export const getSingleBooking = asyncHandler(async (req, res) => {
  const data = await bookings.findById(req?.params?.id);
  res.status(200).json({ status: true, data });
});

export const getAllBookings = asyncHandler(async (req, res) => {
  const data = await bookings.find();
  res.status(200).json({ status: true, data });
});

export const refund = asyncHandler(async (req, res, next) => {
  const existingBooking = await bookings.findById(req?.body?.bookingId);
  razorpayInstance.payments.refund(
    existingBooking?.razorpay_payment_id,
    {
      amount: 50,
      speed: "normal",
      notes: {
        reason: "Customer requested refund",
      },
    },
    function (error, refund) {
      if (error) {
        console.log(error);
        return next(
          new errorResponse(
            error?.error?.description || "Something went wrong !!"
          )
        );
      }

      res.status(200).json({ status: true, message: refund });
    }
  );
});
