import mongoose from "mongoose";

const salaryRecordSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  month: {
    type: String,
    required: true
  },
  basic_salary: {
    type: Number,
    required: true,
    min: [0.01, 'Basic salary must be greater than 0.'],
    max: [10000000, 'Basic salary seems unrealistically high.'], // Added max validation
    validate: { // Added validation for 2 decimal places
      validator: function(v) {
        return /^\d+(\.\d{1,2})?$/.test(v);
      },
      message: props => `${props.value} is not a valid salary. Please use up to two decimal places.`
    }
  },
  allowances: {
    type: Number,
    default: 0,
    min: [0, 'Allowances cannot be negative.'], // Can be 0, so min is 0
    max: [5000000, 'Allowances seem unrealistically high.'],
     validate: { // Added validation for 2 decimal places
      validator: function(v) {
        return /^\d+(\.\d{1,2})?$/.test(v);
      },
      message: props => `${props.value} is not a valid amount. Please use up to two decimal places.`
    }
  },
  OT_hours_normal: {
    type: Number,
    default: 0
  },
  OT_hours_holiday: {
    type: Number,
    default: 0
  },
  OT_amount_normal: {
    type: Number,
    default: 0
  },
  OT_amount_holiday: {
    type: Number,
    default: 0
  },
  short_hours_deduction: {
    type: Number,
    default: 0
  },
  loan_deduction: {
    type: Number,
    default: 0
  },
  tax_deduction: {
    type: Number,
    default: 0
  },
  EPF_employee: {
    type: Number,
    default: 0
  },
  EPF_company: {
    type: Number,
    default: 0
  },
  ETF_company: {
    type: Number,
    default: 0
  },
  gross_salary: {
    type: Number,
    default: 0
  },
  net_salary: {
    type: Number,
    default: 0
  },
  payment_status: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending"
  },
  is_payable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("SalaryRecord", salaryRecordSchema);
