import express from "express";
import {
  createClient,
  getClient,
  getClients,
  updateClient,
  deleteClientAndVisits,
} from "../controllers/client.controller.js";

const router = express.Router();

router.post("/", createClient);
router.get("/:id", getClient);
router.get("/", getClients);
router.put("/:id", updateClient);
router.delete("/:id", deleteClientAndVisits);

export default router;
