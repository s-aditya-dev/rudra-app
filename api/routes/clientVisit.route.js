import express from "express";
import {
  createClientVisit,
  getClientVisits,
} from "../controllers/clientVisit.controller.js";

const router = express.Router();

router.post("/", createClientVisit);
router.get("/", getClientVisits);

export default router;
