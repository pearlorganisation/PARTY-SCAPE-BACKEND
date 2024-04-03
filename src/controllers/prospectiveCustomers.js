import { asyncHandler } from "../utils/asyncHandler.js";
import errorResponse from "../utils/errorResponse.js";
import prospectiveCustomers from "../models/prospectiveCustomers.js";

export const newCustomer = asyncHandler(async (req, res, next) => {
  const existingData = await prospectiveCustomers.findOne({
    email: req?.body?.email,
    name: req?.body?.name,
    number: req?.body?.number,
  });
  if (existingData) {
    return res
      .status(200)
      .json({ status: true, message: "Submitted successfully!!" });
  }
  const newDoc = new prospectiveCustomers(req?.body);
  await newDoc.save();
  res.status(201).json({ status: true, message: "Submitted successfully!!" });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const validId = await prospectiveCustomers.findByIdAndDelete(req?.params?.id);
  if (!validId) {
    return res
      .status(400)
      .json({ status: false, message: "No data found with given id!!" });
  }
  res.status(200).json({ status: true, message: "Deleted successfully!!" });
});

export const getAllCustomers = asyncHandler(async (req, res) => {
  const data = await prospectiveCustomers.find();
  res.status(200).json({ status: true, data });
});
