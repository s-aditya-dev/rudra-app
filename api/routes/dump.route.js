import express from "express";
import {
  getDumpedClients,
  getLostClients,
  getNewClients,
} from "../controllers/dump.controller.js";

const router = express.Router();

router.get("/dumpClients", getDumpedClients);
router.get("/lostClients", getLostClients);
router.get("/newClients", getNewClients);

export default router;
