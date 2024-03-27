import express from "express";
import {
  bookingOrder,
  getAllBookings,
  getSingleBooking,
  verifyOrder,
} from "../controllers/booking.js";

const router = express.Router();
router.post("/bookingOrder", bookingOrder);
router.post("/verifyOrder/:id", verifyOrder);
router.route("/bookings/:id").get(getSingleBooking);
router.route("/").get(getAllBookings);

export default router;
