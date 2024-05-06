import mongoose from "mongoose";
const cakeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required!!"],
    },
    image: {
      type: String,
      required: [true, "cake image is required!!"],
    },
    price: {
      type: [{ weight: String, price: Number, egglessPrice: Number }],
      required: [true, "Price is required!!"],
    },
    // isEggless: {
    //   type: Boolean,
    //   required: [true, "isEgless field is required!!"],
    // },
  },
  { timestamps: true }
);

export default mongoose.model("cake", cakeSchema);
