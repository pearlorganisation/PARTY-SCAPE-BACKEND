import { asyncHandler } from "../utils/asyncHandler.js";
import theater from "../models/theater.js";
import errorResponse from "../utils/errorResponse.js";
import crypto from "crypto";
import fs from "fs";
import exceljs from "exceljs";
import ceremonyType from "../models/optional/ceremonyType.js";
import cakes from "../models/optional/cakes.js";
import { razorpayInstance } from "../configs/razorpay.js";
import bookings from "../models/bookings.js";
import { userBooking } from "../utils/nodemailer.js";
import { userBookingAdmin } from "../utils/forAdmin.js";
import mongoose from "mongoose";

// @desc -creating new order section for razorpay and storing booking data in database
// @route - POST api/v1/bookings
export const bookingOrder = async (req, res, next) => {
  const count = await bookings.countDocuments();
  const bookingId = "PS" + String(count).padStart(5, "0");

  let remainingPrice = Number(req?.body?.data?.theaterPrice) - 750;
  const newBooking = await bookings.create({
    ceremonyType: req?.body?.data?.selectedCeremony?._id,
    addOns: req?.body?.data?.selectedAddOns,
    price: req?.body?.data?.theaterPrice,
    theater: req?.body?.data?.theaterId,
    bookedBy: req?.body?.userDetail?.bookedBy,
    cake: req?.body?.data?.selectedCake?._id,
    ceremonyTypeLabels: req?.body?.data?.selectedCeremonyLabels,
    bookingId,

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
  const { search } = req?.query;
  const { filter } = req?.query;
  const inputDate = new Date(filter);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const month = monthNames[inputDate.getMonth()];
  const day = inputDate.getDate();
  const year = inputDate.getFullYear();
  const formattedDate = month + " " + day + ", " + year;

  const pipeline = [
    {
      $lookup: {
        from: "cakes",
        localField: "cake",
        foreignField: "_id",
        as: "cake",
      },
    },
    {
      $unwind: "$cake",
    },
    {
      $lookup: {
        from: "ceremonytypes",
        localField: "ceremonyType",
        foreignField: "_id",
        as: "ceremonyType",
      },
    },
    { $unwind: "$ceremonyType" },

    {
      $lookup: {
        from: "theater",
        localField: "theater",
        foreignField: "_id",
        as: "theater",
      },
    },
    {
      $unwind: "$theater",
    },
    {
      $match: {
        "bookedBy.name": {
          $regex: search ? `.*${search}.*` : "",
          $options: "i",
        },
      },
    },
    {
      $match: {
        bookedDate: filter ? formattedDate : { $exists: true },
      },
    },
    {
      $addFields: {
        parsedDate: { $dateFromString: { dateString: "$bookedDate" } },
      },
    },
    {
      $sort: {
        parsedDate: -1,
      },
    },
  ];

  await bookings.deleteMany({ isBookedSuccessfully: false });
  const data = await bookings.aggregate(pipeline);

  res.status(200).json({ status: true, data, length: data.length });
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

//@desc - delete booking details api
//@route - GET api/v1/availableSlots/:id
export const deleteBookings = asyncHandler(async (req, res, next) => {
  await bookings.findByIdAndDelete(req?.params?.id);
  res
    .status(200)
    .json({ status: true, message: "Bookings deleted successfully!!" });
});

//@desc - create offline booking
//@route - GET api/v1/offlineBooking/
export const offlineBooking = asyncHandler(async (req, res, next) => {
  const {
    whatsappNumber,
    email,
    name,
    eggLess,
    addOns,
    bookingPrice,
    // ceremonyType,
    // cake,
    bookedSlot,
    quantity,

    date,
    otherDetails,

    totalPeople,
    ceremonyTypeLabels,
  } = req?.body;
  const inputDate = new Date(date);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const month = monthNames[inputDate.getMonth()];
  const day = inputDate.getDate();
  const year = inputDate.getFullYear();
  const formattedDate = month + " " + day + ", " + year;

  const cakePriceData = quantity && JSON.parse(quantity);

  let price = 0;

  const ceremony = await ceremonyType.findById(req?.body?.ceremonyType?.value);

  let updatedCeremony = ceremony?.otherDetails?.map((item, i) => {
    let temDoc = item?._doc;
    return { ...temDoc, value: otherDetails[i] };
  });

  let updatedAddons = addOns?.map((item) => {
    return item?.value;
  });
  const count = await bookings.countDocuments();
  const bookingId = "PS" + String(count).padStart(5, "0");

  const bookingData = await bookings.create({
    theater: req?.body?.theater?.value,
    theaterPrice: bookingPrice,
    bookingId,
    cake: req?.body?.cake?.value?.id,
    price: bookingPrice,

    totalPeople: req?.body?.totalPeople,

    bookingType: "OFFLINE",
    bookedBy: {
      name,
      whatsappNumber,
      email,
    },
    isBookedSuccessfully: true,

    ceremonyType: ceremonyType?.value,
    bookedDate: formattedDate,
    addOns: updatedAddons,
    remainingPrice: Number(bookingPrice - 750),
    cakePrice: cakePriceData?.price,
    isCakeEggLess: eggLess ? true : false,
    cakeQuantity: cakePriceData?.weight,
    bookedSlot: bookedSlot?.label,
    totalPeople: totalPeople?.value,
    ceremonyTypeLabels: updatedCeremony,
  });
  let data = await bookings
    .findById(bookingData._id)
    .populate("cake", ["name"])
    .populate("ceremonyType", ["type"])
    .populate("theater", ["theaterName"]);

  userBooking(data)
    .then(() => {
      userBookingAdmin(data).then(() => {
        res
          .status(201)
          .json({ status: true, message: "Booked successfully!!" });
      });
    })
    .catch((e) => {
      return res
        .status(400)
        .json({ status: true, message: e?.message || "Internal server error" });
    });
});

//@desc - get booking data in excel-sheet
//@route - GET api/v1/sheet/
export const getBookingDataInSheet = asyncHandler(async (req, res, next) => {
  let data = await bookings
    .find()
    .populate("cake", ["name"])
    .populate("ceremonyType", ["type"])
    .populate("theater", ["theaterName"]);
  const workbook = new exceljs.Workbook();
  const sheets = workbook.addWorksheet("bookings");

  sheets.columns = [
    { header: "BookingId", key: "bookingId", width: 25 },
    { header: "Theater", key: "theater", width: 25 },
    { header: "Price", key: "price", width: 25 },
    { header: "BookedSlot", key: "bookedSlot", width: 25 },
    { header: "Total_People", key: "total_People", width: 25 },
    { header: "Booked_date", key: "booked_date", width: 25 },
    { header: "Name", key: "name", width: 25 },
    { header: "email", key: "email", width: 25 },
    { header: "Number", key: "number", width: 25 },
    { header: "Booking_Type", key: "booking_type", width: 25 },
    { header: "Cake", key: "cake", width: 25 },
    { header: "Cake_Type", key: "cake_type", width: 25 },
    { header: "Cake_Price", key: "cake_price", width: 25 },
    { header: "Cake_quantity", key: "cake_quantity", width: 25 },
    { header: "Advance_payment", key: "advance_payment", width: 25 },
    { header: "Total_price", key: "total_price", width: 25 },
    { header: "Remaining_Price", key: "remaining_price", width: 25 },
    { header: "Ceremony_Type", key: "ceremony_type", width: 25 },
    { header: "Ceremony_Details", key: "ceremony_details", width: 40 },
    { header: "Add_Ons", key: "add_ons", width: 25 },
  ];

  data?.map((it) => {
    sheets.addRow({
      bookingId: it?.bookingId,
      theater: it?.theater?.theaterName,
      price: it?.price,
      bookedSlot: it?.bookedSlot,
      total_people: it?.totalPeople,
      total_People: it?.totalPeople,
      booked_date: it?.bookedDate,
      name: it?.bookedBy?.name,
      email: it?.bookedBy?.email,
      number: it?.bookedBy?.whatsappNumber,
      booking_type: it?.bookingType,
      cake: it?.cake?.name,
      cake_type: it?.isCakeEggLess ? "Eggless" : "Regular",
      cake_price: it?.cakePrice,
      cake_quantity: it?.cakeQuantity,
      ceremony_type: it?.ceremonyType?.type,
      ceremony_details: it?.ceremonyTypeLabels?.map((it, i) => {
        return `${it?.label} = ${it?.value}`;
      }),
      advance_payment: "750",
      remaining_price: it?.remainingPrice,
      total_price: it?.price,
      add_ons:
        it?.addOns &&
        it?.addOns?.map((it) => {
          return it?.title;
        }),
    });
  });

  res.setHeader("Content-disposition", "attachment; filename=bookings.xlsx");
  res.setHeader(
    "Content-type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  workbook.xlsx.write(res);
});
