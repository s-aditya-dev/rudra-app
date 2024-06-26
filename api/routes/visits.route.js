import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import { getAllVisits } from "../controllers/client.controller.js";
import {
  getClientVisitDetails,
  getClientVisit,
  updateClientVisit,
  deleteClientVisit,
} from "../controllers/clientVisit.controller.js";

const router = express.Router();

router.get("/", verifyToken, getAllVisits);
router.get("/managers", verifyToken, getClientVisitDetails);
router.get("/:id", verifyToken, getClientVisit);
router.put("/:id", verifyToken, updateClientVisit);
router.delete("/:id", verifyToken, deleteClientVisit);

export default router;
