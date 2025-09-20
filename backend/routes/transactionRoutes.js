import express from "express";
import { createTransaction } from "../controllers/transactionController.js";

const router = express.Router();

// POST: create a transaction
router.post("/", createTransaction);



export default router;
