import express from "express";
import { deleteUser, getUsers } from "../controllers/user.controllers.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.get("/", verifyToken, getUsers);
router.delete("/user/:id", verifyToken, deleteUser);

export default router;
