import mongoose from "mongoose";
const ceremonySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "ceremony type is required!!"],
    },
    logo: {
      type: String,
      required: [true, "creremony logo is required!!"],
    },
    price: {
      type: Number,
      required: [true, "Price is required!!"],
    },
    otherDetails: {
      type: [{ label: String }],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ceremonytypes", ceremonySchema, "ceremonytypes");
