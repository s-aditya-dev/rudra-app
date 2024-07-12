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

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return next(createError(404, "No user found"));

    res.status(200).send(user);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedUser = req.body;

    const user = await User.findByIdAndUpdate(id, updatedUser, { new: true });

    if (!user) return next(createError(404, "user doesn't exists"));

    res.status(200).send(user);
  } catch (error) {
    next(error);
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
