import express from "express";
import { upload } from "../../configs/cloudinary.js";
import {
  deleteAddOns,
  getAllAddOns,
  newAddOn,
} from "../../controllers/optional/addOns.js";
const router = express.Router();
router
  .route("/")
  .get(getAllAddOns)
  .post(
    upload.fields([
      { name: "rose" },
      { name: "photography" },
      { name: "decoration" },
    ]),
    newAddOn
  );
router.route("/:id").delete(deleteAddOns);

export default router;
