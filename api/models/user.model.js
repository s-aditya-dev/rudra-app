import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  dob_month: {
    type: Number,
    required: true,
  },
  dob_date: {
    type: Number,
    required: true,
  },
  dob_year: {
    type: Number,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  alt_phone: {
    type: Number,
  },
  married: {
    type: Boolean,
  },
  address: {
    type: String,
  },
  pincode: {
    type: Number,
  },
  manager: {
    type: String,
    required: true,
  },
});

export default mongoose.model("User", userSchema);
