import express from "express";
import { upload } from "../../configs/cloudinary.js";
import {
  getAllCeremonyType,
  newCeremonyType,
} from "../../controllers/optional/ceremonyType.js";
const router = express.Router();

router
  .route("/")
  .get(getAllCeremonyType)
  .post(upload.single("logo"), newCeremonyType);
export default router;
