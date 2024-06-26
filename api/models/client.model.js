import mongoose from "mongoose";
const { Schema } = mongoose;

const clientSchema = new Schema(
  {
    clientId: {
      type: Number,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    occupation: {
      type: String,
      required: true,
    },
    contact: {
      type: Number,
      required: true,
    },
    altContact: {
      type: Number,
    },
    email: {
      type: String,
      required: true,
    },
    requirement: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
    },
    clientVisits: [
      {
        type: Schema.Types.ObjectId,
        ref: "ClientVisit",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Client", clientSchema);
