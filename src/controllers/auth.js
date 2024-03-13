import { asyncHandler } from "../utils/asyncHandler.js";
import errorResponse from "../utils/errorResponse.js";
import authModel from "../models/auth.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
// import { saveAccessTokenToCookie } from "../utils/others.js";

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

export const login = asyncHandler(async (req, res, next) => {
  console.log(req?.body);
  const { email, password } = req?.body;
  const isDataExists = await authModel.findOne({
    $or: [{ email }, {}],
  });
  if (!isDataExists) return next(new errorResponse("No user found!!", 400));
  //   if (type === "Admin" && isDataExists?.role != "Admin") {
  //     return next(
  //       new errorResponse("Only admin can logg in in admin panel!!", 400)
  //     );
  //   }
  // const isPasswordValid = await bcrypt.compare(
  //   isDataExists?.password,
  //   password
  // );
  // console.log(isPasswordValid, "isPasswordValid");

  // if (!isPasswordValid)
  //   return next(new errorResponse("Wrong password!! please try again", 400));

  // @@Desc-Json web token section and saving it in cookies----
  const accessToken = jwt.sign(
    { userId: isDataExists?._id, email: isDataExists?.email },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.ACCESS_TOKEN_VALIDITY }
  );

  // saveAccessTokenToCookie(isDataExists?.role, res, accessToken);

  res
    .status(200)
    .json({ status: true, message: "Logged in successfully!!", isDataExists });
});

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
