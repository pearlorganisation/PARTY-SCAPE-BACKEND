import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import chalk from "chalk";
import connectDB from "./src/configs/db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

connectDB();
app.use(express.json());
app.use(
  cors(
    process.env.NODE_ENV === "production"
      ? {
          origin: [
            "http://localhost:4112",
            "http://localhost:5010",
            "http://localhost:4113",
            "http://localhost:5173",
            "http://localhost:4114",
            "https://development.pearl-developer.com",
            "https://trade-fair-india.vercel.app",
            "https://trade-fair-india-admin.vercel.app",
            "https://trade-fair-india-shop-panel.vercel.app",
          ],
          credentials: true,
        }
      : {
          origin: [
            "http://localhost:4112",
            "http://localhost:5173",
            "http://localhost:5010",
            "http://localhost:4113",
            "http://localhost:4114",
          ],
          methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
          allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
          credentials: true,
          maxAge: 600,
          exposedHeaders: ["*", "Authorization"],
        }
  )
);
import theaterRoutes from "./src/routes/theater.js";
import addOnsRoutes from "./src/routes/optional/addOns.js";
import cakeRoutes from "./src/routes/optional/cake.js";
import bookingRoutes from "./src/routes/bookings.js";
import authRoutes from "./src/routes/auth.js";
import ceremonyTypeRoutes from "./src/routes/optional/ceremonyType.js";
import { error } from "./src/middlewares/error.js";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/cake", cakeRoutes);
app.use("/api/v1/theater", theaterRoutes);
app.use("/api/v1/addOns", addOnsRoutes);

app.use("/api/v1/ceremonyType", ceremonyTypeRoutes);
app.use(error);

app.listen(PORT, async () => {
  console.log("listening to port 8000");
});
