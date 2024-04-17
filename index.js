import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import chalk from "chalk";
import connectDB from "./src/configs/db.js";

// @@Desc:-----Handling uncaught Exception-----------------
process.on("uncaughtException", (err) => {
  console.log(err);
  console.log(`PARTY_SCAPE_Error: ${err.message}`);
  console.log(
    `PETHEEDS-shutting down the server for handling uncaught exception`
  );
});

const app = express();
const PORT = process.env.PORT || 8080;

// @@Desc:------MIDDLEWARES------
dotenv.config();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
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
            "http://localhost:5174",
            "http://localhost:4114",
            "https://party-scape-frontend.vercel.app",
            "https://party-scape-frontend-l4ej7li9q-pearlorganisation.vercel.app",
          ],
          credentials: true,
        }
      : {
          origin: [
            "http://localhost:4112",
            "http://localhost:5174",
            " https://party-scape-frontend-l4ej7li9q-pearlorganisation.vercel.app",
            "http://localhost:5173",
            "http://localhost:5010",
            "https://party-scape-frontend.vercel.app",
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

// @@Desc:------ROUTES_SECTION------
import theaterRoutes from "./src/routes/theater.js";
import addOnsRoutes from "./src/routes/optional/addOns.js";
import cakeRoutes from "./src/routes/optional/cake.js";
import bookingRoutes from "./src/routes/bookings.js";
import authRoutes from "./src/routes/auth.js";
import prospectiveCustomersRoutes from "./src/routes/prospectiveCustomers.js";
import ceremonyTypeRoutes from "./src/routes/optional/ceremonyType.js";
import { error } from "./src/middlewares/error.js";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/prospectiveCustomers", prospectiveCustomersRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/cake", cakeRoutes);
app.use("/api/v1/theater", theaterRoutes);
app.use("/api/v1/addOns", addOnsRoutes);
app.use("/api/v1/ceremonyType", ceremonyTypeRoutes);
app.use(error);

app.listen(PORT, async () => {
  connectDB(); //mongodb connection
  console.log("listening to port 8000");
});

//@@DESC:--------------unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log(
    chalk.red.bold(`PARTY_SCAPE-Shutting down the server for ${err.message}`)
  );

  console.log(
    chalk.red.bold(
      `PARTY_SCAPE-shutting down the server for unhandle promise rejection`
    )
  );

  server.close(() => {
    process.exit(1);
  });
});
