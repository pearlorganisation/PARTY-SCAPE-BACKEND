import mongoose from "mongoose";
const theaterSchema = new mongoose.Schema(
  {
    theaterName: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
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
    occupancyDetails: {
      maxOccupancy: {
        type: Number,
        required: [true, "Maximum occupancy is required!!"],
      },
      maxPaidOccupancy: {
        type: Number,
        required: [true, "Maximum paid occupany is required!!"],
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
