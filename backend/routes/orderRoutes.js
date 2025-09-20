import express from "express";
import {
  getOrdersByUser,
  getOrderById,
  createOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/user/:userId", getOrdersByUser);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.put("/:id/status", updateOrderStatus);

export default router;
