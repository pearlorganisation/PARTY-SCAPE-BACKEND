import { asyncHandler } from "../utils/asyncHandler.js";
import theater from "../models/theater.js";
import errorResponse from "../utils/errorResponse.js";
import crypto from "crypto";
import { razorpayInstance } from "../configs/razorpay.js";
import bookings from "../models/bookings.js";
import { userBooking } from "../utils/nodemailer.js";
import { userBookingAdmin } from "../utils/forAdmin.js";
import { error } from "console";

// @desc -creating new order section for razorpay and storing booking data in database
// @route - POST api/v1/bookings
export const bookingOrder = async (req, res, next) => {
  let remainingPrice = Number(req?.body?.data?.theaterPrice) - 700;
  const newBooking = await bookings.create({
    ceremonyType: req?.body?.data?.selectedCeremony?._id,
    addOns: req?.body?.data?.selectedAddOns,
    price: req?.body?.data?.theaterPrice,
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

  razorpayInstance.orders
    .create(options)
    .then((order) => {
      res.status(200).json({
        success: true,
        order,
        bookingId: newBooking?._id,
      });
    })
    .catch(async (err) => {
      await bookings.findByIdAndDelete(newBooking._id);
      return res.status(400).json({
        status: true,
        message: err?.message || "Internal server error!!",
      });
    });
};

// @desc - verifying razorpay order api
// @route - POST api/v1/bookings/verifyOrder
export const verifyOrder = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  await bookings.findByIdAndUpdate(req?.params?.id, {
    razorpay_order_id,
    isBookedSuccessfully: true,
    razorpay_payment_id,
    razorpay_payment_id,
  });

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (!isAuthentic) {
    await bookings.findByIdAndDelete(req?.params?.id);
    res.redirect(`${process.env.FRONTEND_LIVE_URL}/paymentFailed/`);
  }
  let data = await bookings
    .findById(req?.params?.id)
    .populate("cake", ["name"])
    .populate("ceremonyType", ["type"])
    .populate("theater", ["theaterName"]);

  userBooking(data)
    .then(() => {
      userBookingAdmin(data).then(() => {
        res.redirect(`${process.env.FRONTEND_LIVE_URL}/paymentSuccess`);
      });
    })
    .catch((e) => {
      return res
        .status(400)
        .json({ status: true, message: e?.message || "Internal server error" });
    });
});

// @desc -creating get single booking data api
// @route - GET api/v1/bookings/:id
export const getSingleBooking = asyncHandler(async (req, res) => {
  const data = await bookings.findById(req?.params?.id);
  res.status(200).json({ status: true, data });
});

// @desc - get all bookings data
// @route - GEt api/v1/bookings
export const getAllBookings = asyncHandler(async (req, res) => {
  // const pipeline = [
  //   {
  //     $lookup: {
  //       from: "cake",
  //       localField: "cake",
  //       foreignField: "_id",
  //       as: "cake",
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "ceremonyType",
  //       localField: "ceremonyType",
  //       foreignField: "_id",
  //       as: "ceremonyType",
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "theater",
  //       localField: "theater",
  //       foreignField: "_id",
  //       as: "theater",
  //     },
  //   },
  //   {
  //     $match: {
  //       if(req?)
  //     },
  //   },
  // ];

  await bookings.deleteMany({ isBookedSuccessfully: false });
  const data = await bookings.find({}).populate("theater", ["theaterName"]);
  res.status(200).json({ status: true, data });
});

// @desc -creating new user
// @route - POST api/v1/auth/signup
export const refund = asyncHandler(async (req, res, next) => {
  const existingBooking = await bookings.findOne({
    bookingId: req?.body?.bookingId,
  });
  razorpayInstance.payments.refund(
    existingBooking?.razorpay_payment_id,
    {
      amount: 700,
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

      res.status(200).json({ status: true, refund });
    }
  );
});

//@desc - gettting datewise available slots
//@route - GET api/v1/availableSlots
export const availableSlots = asyncHandler(async (req, res, next) => {
  const options = { year: "numeric", month: "short", day: "2-digit" };
  const formattedDate = new Date().toLocaleDateString("en-US", options);
  const bookedSlotsData = await bookings.find(
    {
      bookedDate: formattedDate,
    },
    { theater: true, bookedSlot: true }
  );

  const totalSlots = await theater.find(
    {},
    { occupancyDetails: true, slots: true, theaterName: true }
  );

  let availableSlotsData = [];
  for (let i = 0; i < totalSlots?.length; i++) {
    let availableSlots = [];
    for (let j = 0; j < bookedSlotsData?.length; j++) {
      let sTime = bookedSlotsData[j].bookedSlot.split("-")[0];
      let eTime = bookedSlotsData[j].bookedSlot.split("-")[1];
      availableSlots = totalSlots[i].slots.filter((item) => {
        return item?.start?.toString() != eTime && item?.end?.toString();
      });
      availableSlotsData.push({
        slots: availableSlots,
        theater: totalSlots[i].theaterName,
      });
      availableSlots = [];
    }
  }

  res.status(200).json({ status: true, availableSlotsData });
});
