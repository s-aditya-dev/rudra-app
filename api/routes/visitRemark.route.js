import express from "express";
import {
  deleteVisitRemark,
  updateVisitRemark,
  addRemark,
} from "../controllers/visitRemark.controller.js";

const router = express.Router();

router.post("/:visitId/remark", addRemark);
router.put("/:visitId/:remarkId", updateVisitRemark);
router.delete("/:visitId/:remarkId", deleteVisitRemark);

export default router;
