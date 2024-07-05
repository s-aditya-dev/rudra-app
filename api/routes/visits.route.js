import express from "express";
import { getAllVisits } from "../controllers/client.controller.js";
import {
  getClientVisitDetails,
  getClientVisit,
  updateClientVisit,
  deleteClientVisit,
} from "../controllers/clientVisit.controller.js";

const router = express.Router();

router.get("/", getAllVisits);
router.get("/managers", getClientVisitDetails);
router.get("/:id", getClientVisit);
router.put("/:id", updateClientVisit);
router.delete("/:id", deleteClientVisit);

export default router;
