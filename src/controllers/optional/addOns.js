import { asyncHandler } from "../../utils/asyncHandler.js";
import errorResponse from "../../utils/errorResponse.js";
import addOns from "../../models/optional/addOns.js";

export const newAddOn = asyncHandler(async (req, res, next) => {
  const newDoc = await new addOns({});
  await newDoc.save();
  res.status(201).json({ status: true, message: "Created successfully!!" });
});

export const getAllAddOns = asyncHandler(async (req, res, next) => {
  const data = await addOns.find();
  res
    .status(200)
    .json({ status: true, message: "Data found successfully!!", data });
});

export const deleteAddOns = asyncHandler(async (req, res, next) => {
  const { id } = req?.params;
  const doc = await addOns.findByIdAndDelete(id);
  if (!doc) return next(new errorResponse("No data found!!", 400));
  res.status(200).json({ status: true, message: "Deleted successfully!!" });
});
