import express from "express";
import {
  getAllSalaryRecords,
  getSalaryRecordById,
  createSalaryRecord,
  updateSalaryRecord,
  deleteSalaryRecord,
  generateSalarySlip,
  emailSalarySlip
} from "../controllers/salaryController.js";

const router = express.Router();

router.get("/", getAllSalaryRecords);
router.get("/:id", getSalaryRecordById);
router.post("/", createSalaryRecord);
router.put("/:id", updateSalaryRecord);
router.delete("/:id", deleteSalaryRecord);
router.get("/:id/slip", generateSalarySlip);
router.post("/:id/email", emailSalarySlip);

export default router;