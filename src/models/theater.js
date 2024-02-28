import mongoose from "mongoose";
const theaterSchema = new mongoose.Schema(
  {
    theaterName: {
      type: String,
      required: true,
    },
    theaterCharges: {
      type: Number,
      required: [true, "Theater charges is required!!"],
    },
    decorationCharges: {
      type: Number,
      required: [true, "Decoration charges is required!!"],
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
          required: String,
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
      required: true,
    },
    occupancyDetails: {
      minOccupancy: {
        type: Number,
      },

      extraCharges: {
        type: Number,
        required: [true, "Extra charges field is required!!"],
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("theater", theaterSchema, "theater");
