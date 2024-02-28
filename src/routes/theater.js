import express from "express";
import { upload } from "../configs/cloudinary.js";
import {
  deleteTheater,
  getAllTheater,
  newTheater,
} from "../controllers/theater.js";
const router = express.Router();
router
  .route("/")
  .post(upload.fields([{ name: "logo" }, { name: "gallery" }]), newTheater)
  .get(getAllTheater);
router.route("/:id").patch().delete(deleteTheater);
export default router;
