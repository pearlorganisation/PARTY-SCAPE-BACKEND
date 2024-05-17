import { asyncHandler } from "../../utils/asyncHandler.js";
import errorResponse from "../../utils/errorResponse.js";
import ceremonyType from "../../models/optional/ceremonyType.js";

export const newCeremonyType = asyncHandler(async (req, res, next) => {
  console.log(req?.file);
  const newDoc = new ceremonyType({
    ...req?.body,
    // logo: req?.file?.path,
    otherDetails: JSON.parse(req?.body?.otherDetails),
  });
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

export const deleteCeremonyType = asyncHandler(async (req, res, next) => {
  const data = await ceremonyType.findByIdAndDelete(req?.params?.id);
  if (!data) {
    return res
      .status(400)
      .json({ status: false, message: "No data found with given id!!" });
  }
  res.status(200).json({
    status: true,
    message: "Deleted Successfully!!",
  });
});
