import express from "express";
import {
  availableSlots,
  bookingOrder,
  deleteBookings,
  getAllBookings,
  getSingleBooking,
  refund,
  verifyOrder,
} from "../controllers/booking.js";

const router = express.Router();
router.post("/bookingOrder", bookingOrder);
router.post("/verifyOrder/:id", verifyOrder);
router.route("/bookings/:id").get(getSingleBooking);
router.route("/").get(getAllBookings);
router.route("/refund").post(refund);
router.route("/:id").delete(deleteBookings);
router.route("/availableSlots").get(availableSlots);

export default router;
