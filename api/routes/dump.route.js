import express from "express";
import {
  getDumpedClients,
  getLostClients,
} from "../controllers/dump.controller.js";

const router = express.Router();

router.get("/dumpClients", getDumpedClients);
router.get("/lostClients", getLostClients);

export default router;
