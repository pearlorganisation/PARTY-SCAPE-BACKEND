import { asyncHandler } from "../../utils/asyncHandler.js";
import errorResponse from "../../utils/errorResponse.js";
import ceremonyType from "../../models/optional/ceremonyType.js";

export const newCeremonyType = asyncHandler(async (req, res, next) => {
  const newDoc = new ceremonyType({ ...req?.body, logo: req?.file?.path });
  await newDoc.save();
  res.status(201).json({ status: true, message: "Created successfully!!" });
});

export const getAllCeremonyType = asyncHandler(async (req, res, next) => {
  const data = await ceremonyType.find();
  res.status(200).json({
    status: true,
    message: data?.length >= 1 ? "Data found successfully!!" : "No data found",
    data,
  });
});
