import express from "express";
import { upload } from "../../configs/cloudinary.js";
import {
  deleteCake,
  getAllCakes,
  newCake,
} from "../../controllers/optional/cakes.js";

const router = express.Router();
router.route("/").get(getAllCakes).post(upload.single("logo"), newCake);

router.route("/:id").delete(deleteCake);
export default router;
