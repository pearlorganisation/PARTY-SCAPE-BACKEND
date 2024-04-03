import express from "express";
import { upload } from "../../configs/cloudinary.js";
import {
  deleteCake,
  getAllCakes,
  newCake,
  updateCake,
} from "../../controllers/optional/cakes.js";

const router = express.Router();
router.route("/").get(getAllCakes).post(upload.single("image"), newCake);

router
  .route("/:id")
  .delete(deleteCake)
  .patch(upload.single("image"), updateCake);
export default router;
