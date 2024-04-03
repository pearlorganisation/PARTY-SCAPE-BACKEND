import express from "express";
import { upload } from "../configs/cloudinary.js";
import {
  deleteTheater,
  getAllTheater,
  getParticularTheater,
  newTheater,
  updateTheater,
} from "../controllers/theater.js";
const router = express.Router();
router
  .route("/")
  .post(upload.fields([{ name: "logo" }, { name: "gallery" }]), newTheater)
  .get(getAllTheater);

router
  .route("/:id")
  .patch(upload.fields([{ name: "logo" }, { name: "gallery" }]), updateTheater)
  .delete(deleteTheater)
  .get(getParticularTheater);

export default router;
