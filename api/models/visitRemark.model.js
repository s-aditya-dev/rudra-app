import mongoose from "mongoose";
const { Schema } = mongoose;

const visitRemarkSchema = new Schema(
  {
    visitRemark: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
    },
    time: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("VisitRemark", visitRemarkSchema);