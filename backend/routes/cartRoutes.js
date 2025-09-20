import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/:userId", getCart);
router.post("/:userId/items", addToCart);
router.put("/:userId/items/:productId", updateCartItem);
router.delete("/:userId/items/:productId", removeCartItem);

export default router;
