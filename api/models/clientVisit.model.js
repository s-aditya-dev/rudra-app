import mongoose from "mongoose";
const { Schema } = mongoose;

const clientVisitSchema = new Schema(
  {
    date: {
      type: String,
    },
    time: {
      type: String,
    },

    referenceBy: {
      type: String,
    },
    sourcingManager: {
      type: String,
      required: true,
    },
    relationshipManager: {
      type: String,
      required: true,
    },
    closingManager: {
      type: String,
      required: true,
    },
    status: {
      required: true,
      type: String,
    },
    visitRemark: {
      type: String,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ClientVisit", clientVisitSchema);
