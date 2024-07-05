import express from "express";
import { getUserClients } from "../controllers/client.controller.js";

const router = express.Router();

router.get("/", getUserClients);

export default router;
