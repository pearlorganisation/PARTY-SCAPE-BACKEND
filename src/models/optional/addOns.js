import mongoose from "mongoose";
const addOnSchema = new mongoose.Schema(
  {
    decoration: [{ title: String, price: Number }],
    rose: [{ title: String, price: Number }],
    photography: [{ title: String, price: Number }],
  },
  { timestamps: true }
);

export default mongoose.model("addons", addOnSchema, "addons");
