import express from "express";
import { getAllVisits } from "../controllers/client.controller.js";
import {
  getManagers,
  getClientVisitWithRemark,
  updateClientVisit,
  deleteClientVisit,
} from "../controllers/clientVisit.controller.js";

const router = express.Router();

router.get("/", getAllVisits);
router.get("/managers", getManagers);
router.get("/:id", getClientVisitWithRemark);
router.put("/:id", updateClientVisit);
router.delete("/:id", deleteClientVisit);

export default router;
