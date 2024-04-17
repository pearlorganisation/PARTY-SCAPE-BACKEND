import cron from "node-cron";
import { CronJob } from "cron";
import bookings from "../models/bookings.js";

const reminderFunction = async () => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const date = new Date().toLocaleDateString("en-US", options);
  console.log("hellololol");
  const bookingsData = await bookings.find();
};

cron.schedule("* * * * *", () => {
  console.log("This will run every minute");
});
