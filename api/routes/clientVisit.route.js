import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import {
  createClientVisit,
  getClientVisits,
} from "../controllers/clientVisit.controller.js";

const router = express.Router();

router.post("/", verifyToken, createClientVisit);
router.get("/", verifyToken, getClientVisits);

export default router;
