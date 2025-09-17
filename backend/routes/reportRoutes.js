import express from "express";
import {
  generateBalanceSheet,
  generateProfitLossStatement
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/balance-sheet", generateBalanceSheet);
router.get("/profit-loss", generateProfitLossStatement);

export default router;