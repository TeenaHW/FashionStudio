import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    description: {
      type: String,
      required: true,
      trim: true,
    },
    total_amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    paid_status: {
      type: String,
      enum: ["Paid", "Not Paid"],
      default: "Not Paid",
    },
    paid_date: {
      type: Date,
      default: null,
    },
    is_payable: {
      type: Boolean,
      default: true, // true if "Not Paid"
    },
  },
  { timestamps: true }
);

// Pre-save hook to update is_payable and paid_date automatically
transactionSchema.pre("save", function (next) {
  if (this.paid_status === "Paid") {
    this.is_payable = false;
    if (!this.paid_date) {
      this.paid_date = new Date();
    }
  } else {
    this.is_payable = true;
    this.paid_date = null;
  }
  next();
});

const Transaction = mongoose.model("Transaction", transactionSchema,"transactions");
export default Transaction;

