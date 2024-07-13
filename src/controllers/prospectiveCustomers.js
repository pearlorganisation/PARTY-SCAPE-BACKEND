import { asyncHandler } from "../utils/asyncHandler.js";
import errorResponse from "../utils/errorResponse.js";
import exceljs from "exceljs";
import prospectiveCustomers from "../models/prospectiveCustomers.js";

// @desc -creating new user
// @route - POST api/v1/auth/prospectiveCustomers
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
  res
    .status(201)
    .json({ status: true, message: "Submitted successfully!!", newDoc });
});

// @desc -delete existing customers
// @route - POST api/v1/prospectiveCustomers/:id
export const deleteCustomer = asyncHandler(async (req, res) => {
  const validId = await prospectiveCustomers.findByIdAndDelete(req?.params?.id);
  if (!validId) {
    return res
      .status(400)
      .json({ status: false, message: "No data found with given id!!" });
  }
  res.status(200).json({ status: true, message: "Deleted successfully!!" });
});

// @desc -get all prospectiveCustomers
// @route - GET api/v1/auth/prospectiveCustomers
export const getAllCustomers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const length = await prospectiveCustomers.countDocuments();
  const data = await prospectiveCustomers
    .find()
    .skip((page - 1) * limit)
    .limit(limit);

  res
    .status(200)
    .json({ status: true, data, totalPages: Math.ceil(length / limit) });
});

// @desc -get all prospective Customers data in excel sheet
// @route - GET api/v1/auth/prospectiveCustomers/sheet
export const getDataSheet = asyncHandler(async (req, res) => {
  const data = await prospectiveCustomers.find();

  const workbook = new exceljs.Workbook();
  const sheets = workbook.addWorksheet("prospects");
  sheets.columns = [
    { header: "Name", key: "name", width: 25 },
    { header: "Email", key: "email", width: 25 },
    { header: "Number", key: "number", width: 25 },
  ];

  data?.map((it) => {
    sheets.addRow({ name: it?.name, email: it?.email, number: it?.number });
  });
  res.setHeader("Content-disposition", "attachment; filename=prospects.xlsx");
  res.setHeader(
    "Content-type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  workbook.xlsx.write(res);
});
