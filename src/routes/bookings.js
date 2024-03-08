import express from "express";
import {
  bookingOrder,
  getSingleBooking,
  verifyOrder,
} from "../controllers/booking.js";

const router = express.Router();
router.post("/bookingOrder", bookingOrder);
router.post("/verifyOrder", verifyOrder);
router.route("/bookings/:id").get(getSingleBooking);

export default router;
