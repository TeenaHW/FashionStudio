import express from "express";
import { sendInvoice, generateInvoice } from "../controllers/invoiceController.js";

const router = express.Router();
router.post("/send", sendInvoice);
router.post("/generate", generateInvoice); // streams PDF back

export default router;
