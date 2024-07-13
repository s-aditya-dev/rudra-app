import express from "express";
import {
  createClientWithVisit,
  createClient,
  getClient,
  getClients,
  updateClient,
  deleteClientAndVisits,
} from "../controllers/client.controller.js";

const router = express.Router();

router.post("/withVisit", createClientWithVisit);
router.post("/", createClient);
router.get("/:id", getClient);
router.get("/", getClients);
router.put("/:id", updateClient);
router.delete("/:id", deleteClientAndVisits);

export default router;
