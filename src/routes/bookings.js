import express from "express";
import {
  availableSlots,
  bookingOrder,
  deleteBookings,
  getAllBookings,
  getBookingDataInSheet,
  getSingleBooking,
  offlineBooking,
  refund,
  verifyOrder,
} from "../controllers/booking.js";

const router = express.Router();
router.post("/bookingOrder", bookingOrder);
router.post("/verifyOrder/:id", verifyOrder);
router.route("/bookings/:id").get(getSingleBooking);
router.route("/").get(getAllBookings);
router.route("/sheet").get(getBookingDataInSheet);
router.route("/refund").post(refund);
router.route("/:id").delete(deleteBookings);
router.route("/availableSlots").get(availableSlots);
router.route("/offlineBooking").post(offlineBooking);

export default router;
