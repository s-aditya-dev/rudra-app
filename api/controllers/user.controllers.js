import User from "../models/user.model.js";
import createError from "../utils/createError.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});

    res.status(200).send(users);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(createError(404, "user not found"));

    res.status(200).send("user deleted");
  } catch (err) {
    next(err);
  }
};
