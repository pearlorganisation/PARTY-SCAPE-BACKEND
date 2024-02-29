import express from "express";
import { upload } from "../../configs/cloudinary.js";
import { getAllCakes, newCake } from "../../controllers/optional/cakes.js";

const router = express.Router();
router.route("/").get(getAllCakes).post(upload.single("logo"), newCake);
export default router;
