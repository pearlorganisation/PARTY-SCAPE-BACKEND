import { asyncHandler } from "../utils/asyncHandler.js";
import errorResponse from "../utils/errorResponse.js";
import theater from "../models/theater.js";
import bookings from "../models/bookings.js";

// @desc -creating new theater
// @route - POST api/v1/theater
export const newTheater = asyncHandler(async (req, res, next) => {
  const { logo, gallery } = req?.files;
  const newDoc = new theater({
    ...req?.body,
    occupancyDetails:
      req?.body?.occupancyDetails && JSON.parse(req?.body?.occupancyDetails),
    features: req?.body?.features && JSON.parse(req?.body?.features),
    slots: req?.body?.slots && JSON.parse(req?.body?.slots),
    logo: Array.isArray(logo) && logo.length >= 1 && logo[0],
    gallery: Array.isArray(gallery) && gallery.length >= 1 && gallery,
  });
  await newDoc.save();
  res.status(200).json({ status: true, newDoc });
});

// @desc -get all theater
// @route - GET api/v1/theater
export const getAllTheater = asyncHandler(async (req, res, next) => {
  const data = await theater.find();
  res.status(200).json({ status: true, data });
});

// @desc -delete existing theater
// @route - DELETE api/v1/theater/:id
export const deleteTheater = asyncHandler(async (req, res, next) => {
  const isValidData = await theater.findByIdAndDelete(req?.params?.id);
  if (!isValidData)
    return next(new errorResponse("No data found with given id!!", 400));

  res.status(200).json({ status: true, message: "Deleted successfully!!" });
});

// @desc - updating existing theater
// @route - PATCh api/v1/theater/:id
export const updateTheater = asyncHandler(async (req, res, next) => {
  const { id } = req?.params;
  let { logo, gallery } = req?.files;
  console.log(logo);
  const existingData = await theater.findById(id);
  if (!existingData) {
    return next(new errorResponse("No data found with given id!!", 400));
  }
  if (!Array.isArray(logo) || logo?.length < 1) {
    logo = existingData?.logo;
  } else {
    logo = logo[0];
  }
  if (!Array.isArray(gallery) || gallery?.length < 1) {
    gallery = existingData?.gallery;
  }

  await theater.findByIdAndUpdate(id, {
    ...req?.body,
    occupancyDetails: JSON.parse(req?.body?.occupancyDetails),
    features: JSON.parse(req?.body?.features),
    slots: JSON.parse(req?.body?.slots),
    logo,
    gallery,
  });
  res.status(200).json({ status: true, message: "Updated Successfully!!" });
});

// @desc - get particular theater and populating booked slots in it
// @route - GET api/v1/theater/:id
export const getParticularTheater = asyncHandler(async (req, res, next) => {
  const { id } = req?.params;

  // Find the theater based on the theaterName
  const data = await theater.findOne({ theaterName: new RegExp(id, "i") });

  // Delete bookings that are not successfully booked
  await bookings.deleteMany({ isBookedSuccessfully: false });

  // Get all bookings with the relevant fields and populate the theater name
  const bookingData = await bookings
    .find({}, { theater: true, bookedDate: true, bookedSlot: true })
    .populate("theater", ["theaterName"]);

  const bookedSlots = [];

  // Iterate through each booking
  bookingData.forEach((booking) => {
    const { bookedDate, bookedSlot } = booking;

    // Find if the booked date already exists in the bookedSlots array
    const existingSlotIndex = bookedSlots.findIndex(
      (slot) => slot.date === bookedDate
    );

    if (existingSlotIndex !== -1) {
      // If the date exists, push the booked slot to the existing date's slots array
      bookedSlots[existingSlotIndex].slots.push(bookedSlot);
    }
  });

  // Filter out any entries that are not present in the booking model
  const filteredBookedSlots = bookedSlots.filter((slot) =>
    bookingData.some((booking) => booking.bookedDate === slot.date)
  );

  // Return the filtered booked slots
  res
    .status(200)
    .json({ status: true, data, bookedSlots: filteredBookedSlots });
});
