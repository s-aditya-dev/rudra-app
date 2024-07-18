import mongoose from "mongoose";
const { Schema } = mongoose;

const clientVisitSchema = new Schema(
  {
    date: {
      type: Date,
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
    visitRemarkId: [
      {
        type: Schema.Types.ObjectId,
        ref: "VisitRemark",
      },
    ],
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
