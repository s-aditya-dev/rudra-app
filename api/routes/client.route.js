import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import {
  createClient,
  getClient,
  getClients,
  updateClient,
  deleteClientAndVisits,
} from "../controllers/client.controller.js";

const router = express.Router();

router.post("/", verifyToken, createClient);
router.get("/:id", verifyToken, getClient);
router.get("/", verifyToken, getClients);
router.put("/:id", verifyToken, updateClient);
router.delete("/:id", verifyToken, deleteClientAndVisits);

export default router;
