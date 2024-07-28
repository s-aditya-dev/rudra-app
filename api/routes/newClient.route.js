import express from "express";
import {
  createNewClient,
  getNewClient,
  getNewClients,
  updateNewClient,
  deleteNewClient,
  newClientAddVisit,
} from "../controllers/newClient.controller.js";

const router = express.Router();

router.get("/", getNewClients);
router.post("/newClient", createNewClient);
router.post("/withVisit/:id", newClientAddVisit);
router.get("/:id", getNewClient);
router.put("/:id", updateNewClient);
router.delete("/:id", deleteNewClient);

export default router;
