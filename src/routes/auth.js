import express from "express";
import { upload } from "../configs/cloudinary.js";
import { login, logout, signup } from "../controllers/auth.js";

const router = express.Router();
router.route("/signup").post(upload.none(), signup);
router.route("/login").post(login);
router.route("/logout").post(logout);
export default router;
