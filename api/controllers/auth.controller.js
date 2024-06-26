import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";

export const register = async (req, res, next) => {
  try {
    const newUser = new User({
      ...req.body,
    });

    await newUser.save();
    res.status(200).send("user has been created");
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({
      username: req.body.username,
    });

    if (!user) return next(createError(404, "User not found!"));
    if (
      user.username === req.body.username &&
      user.password !== req.body.password
    )
      return next(createError(400, "Wrong username or password"));

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_KEY
    );

    const { ...info } = user._doc;
    res
      .cookie("accessToken", token, {
        httpOnly: true,
      })
      .status(200)
      .send(info);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  res
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .status(200)
    .send("User has been logged out");
};
