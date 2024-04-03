import express from "express";
import {
  deleteCustomer,
  getAllCustomers,
  newCustomer,
} from "../controllers/prospectiveCustomers.js";

const router = express.Router();
router.route("/").post(newCustomer).get(getAllCustomers);
router.route("/:id").delete(deleteCustomer);
export default router;
