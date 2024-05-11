import express from "express";
import {
  deleteCustomer,
  getAllCustomers,
  getDataSheet,
  newCustomer,
} from "../controllers/prospectiveCustomers.js";

const router = express.Router();
router.route("/").post(newCustomer).get(getAllCustomers);
router.route("/sheet").get(getDataSheet);
router.route("/:id").delete(deleteCustomer);
export default router;
