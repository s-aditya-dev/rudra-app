import mongoose from "mongoose";
const { Schema } = mongoose;

const newClientCounterSchema = new Schema({
  id: {
    type: String,
  },
  seq: {
    type: Number,
  },
});

export default mongoose.model("NewClientCounter", newClientCounterSchema);
