import mongoose from "mongoose";
const theaterSchema = new mongoose.Schema(
  {
    theaterName: {
      type: String,
      required: true,
    },
    showCake: {
      type: Boolean,
    },
    videoUrl: {
      type: String,
    },
    logo: {
      type: {},
      required: true,
    },
    gallery: {
      type: [],
    },

    features: {
      type: [],
      required: true,
    },
    slots: {
      type: [
        {
          start: String,
          end: String,
          theaterPrice: Number,
          decorationPrice: Number,
          price: Number,
          offerPrice: Number,

          isBooked: {
            type: Boolean,
            default: false,
          },
        },
      ],
      required: true,
    },
    location: {
      type: String,
      // required: true,
    },
    occupancyDetails: {
      max: {
        type: Number,
      },
      maxPaid: {
        type: Number,
      },

      extraCharges: {
        type: Number,
        // required: [true, "Extra charges field is required!!"],
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("theater", theaterSchema, "theater");
