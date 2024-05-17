import express from "express";
import upload from "../../configs/multer.js";
import {
  deleteCeremonyType,
  getAllCeremonyType,
  newCeremonyType,
} from "../../controllers/optional/ceremonyType.js";
const router = express.Router();

router.route("/").get(getAllCeremonyType).post(upload.none(), newCeremonyType);

router.route("/:id").delete(deleteCeremonyType);
export default router;
