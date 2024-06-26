import mongoose from "mongoose";
const { Schema } = mongoose;

const clientCounterSchema = new Schema({
  id: {
    type: String,
  },
  seq: {
    type: Number,
  },
});

export default mongoose.model("ClientCounter", clientCounterSchema);
