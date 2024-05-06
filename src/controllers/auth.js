import { asyncHandler } from "../utils/asyncHandler.js";
import errorResponse from "../utils/errorResponse.js";
import authModel from "../models/auth.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
// import { saveAccessTokenToCookie } from "../utils/others.js";

// @desc -creating new user
// @route - POST api/v1/auth/signup
export const signup = asyncHandler(async (req, res, next) => {
  const { password } = req?.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, 10);
  const newData = new authModel({ ...req?.body, password: hashedPassword });
  const savedData = await newData.save();
  res
    .status(201)
    .json({ status: true, message: "Created successfully!!", newData });
});

// @desc - log in
// @route - POST api/v1/auth/login
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req?.body;
  const isDataExists = await authModel.findOne({
    $or: [{ email }, {}],
  });

  if (!isDataExists) return next(new errorResponse("No user found!!", 400));

  if (isDataExists?.password != password) {
    return next(new errorResponse("Wrong password!! please try again", 400));
  }

  res.status(200).json({ status: true, message: "Logged in successfully!!" });
});

// @desc - logout user
// @route - POST api/v1/auth/logout
export const logout = asyncHandler(async (req, res, next) => {
  try {
    res.clearCookie("ACCESS_TOKEN_PARTYSCAPE");
    res.status(200).json({
      success: true,
      message: "Logged Out Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Internal Server Error! ${error.message}`,
    });
  }
});
