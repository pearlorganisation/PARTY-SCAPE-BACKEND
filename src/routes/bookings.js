import express from "express";
import { bookingOrder, verifyOrder } from "../controllers/booking.js";

const router = express.Router();
router.post("/bookingOrder", bookingOrder);
router.route("/verifyOrder").post(verifyOrder);
export default router;
