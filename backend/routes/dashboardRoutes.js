import express from "express";
import {
  getDashboardKPIs,
  getMonthlySales,
  getExpensesBreakdown
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/kpis", getDashboardKPIs);
router.get("/monthly-sales", getMonthlySales);
router.get("/expenses-breakdown", getExpensesBreakdown);

export default router;