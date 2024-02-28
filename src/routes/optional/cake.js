import express from "express";
import { getAllCakes } from "../../controllers/optional/cakes";

const router = express.Router();
router.route("/").get(getAllCakes).post(getAllCakes);
export default router;
