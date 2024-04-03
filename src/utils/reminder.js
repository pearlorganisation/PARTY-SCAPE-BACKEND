// import { CronJob } from "cron";
// import bookings from "../models/bookings.js";

// const reminderFunction = async () => {
//   const options = {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   };
//   const date = new Date().toLocaleDateString("en-US", options);
//   console.log(date);
//   const bookingsData = await bookings.find();
// };

// export const job = new CronJob(
//   "* * * * *", // (runs every minute)
//   reminderFunction,
//   null,
//   true,
//   "America/Los_Angeles"
// );
