import express from "express";
import {
  getPaymentByOrder,
  createPayment,
  updatePaymentStatus,
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/order/:orderId", getPaymentByOrder);
router.post("/", createPayment);
router.put("/:id/status", updatePaymentStatus);

export default router;
