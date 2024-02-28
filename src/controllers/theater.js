import { asyncHandler } from "../utils/asyncHandler.js";
import errorResponse from "../utils/errorResponse.js";
import theater from "../models/theater.js";

export const newTheater = asyncHandler(async (req, res, next) => {
  console.log(req?.body?.slots, typeof JSON.parse(req?.body?.slots));
  const newDoc = new theater({
    ...req?.body,
    occupancyDetails: JSON.parse(req?.body?.occupancyDetails),
    slots: JSON.parse(req?.body?.slots),
    logo: req?.file?.path,
  });
  await newDoc.save();
  res.status(200).json({ status: true, newDoc });
});

export const getAllTheater = asyncHandler(async (req, res, next) => {
  const data = await theater.find();
  res.status(200).json({ status: true, data });
});

export const deleteTheater = asyncHandler(async (req, res, next) => {
  const isValidData = await theater.findByIdAndDelete(req?.params?.id);
  if (!isValidData)
    return next(new errorResponse("No data found with given id!!", 400));

  res.status(200).json({ status: true, message: "Deleted successfully!!" });
});

export const updateTheater = asyncHandler(async (req, res, next) => {
  const { id } = req?.params;
  const existingData = await theater.findById();
  if (!existingData) {
    return next(new errorResponse("No data found with given id!!", 400));
  }

  await theater.findByIdAndUpdate();
});
