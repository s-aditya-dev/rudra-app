import express from "express";
import { deleteUser, getUsers } from "../controllers/user.controllers.js";

const router = express.Router();

router.get("/", getUsers);
router.delete("/user/:id", deleteUser);

export default router;
