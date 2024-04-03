import cakes from "../../models/optional/cakes.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import errorResponse from "../../utils/errorResponse.js";
// import cakes from "../../models/optional/cakes.js";

export const newCake = asyncHandler(async (req, res, next) => {
  const newDoc = new cakes({ ...req?.body, image: req?.file?.path });
  await newDoc.save();
  res.status(201).json({ status: true, message: "Created successfully!!" });
});

export const getAllCakes = asyncHandler(async (req, res, next) => {
  const data = await cakes.find();
  res.status(200).json({
    status: true,
    message: data?.length >= 1 ? "Data found successfully!!" : "No data found",
    data,
  });
});

export const deleteCake = asyncHandler(async (req, res, next) => {
  const isValidId = await cakes.findByIdAndDelete(req?.params?.id);
  res.status(200).json({ status: true, message: "Deleted successfully!!" });
});

export const updateCake = asyncHandler(async (req, res, next) => {
  const existingData = await cakes.findById(req?.params?.id);
  const data = await cakes.findByIdAndUpdate(req?.params?.id, {
    price: JSON.parse(req?.body?.parse),
    cake: req?.file?.path || existingData?.image,
    ...req?.body,
  });
  if (!data)
    return next(new errorResponse("No data found with given id!!", 400));

  res.status(200).json({ status: true, message: "Updated successfully!!" });
});
