import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  principal: {
    type: Number,
    required: true,
    min: [0.01, 'Principal amount must be greater than 0.'],
    max: [50000000, 'Principal amount seems unrealistically high.'], // Added max validation
    validate: { // Added validation for 2 decimal places
      validator: function(v) {
        return /^\d+(\.\d{1,2})?$/.test(v);
      },
      message: props => `${props.value} is not a valid amount. Please use up to two decimal places.`
    }
  },
  installment_amount: {
    type: Number,
    required: true,
    min: [0.01, 'Installment amount must be greater than 0.'],
    validate: { // Added validation for 2 decimal places
      validator: function(v) {
        return /^\d+(\.\d{1,2})?$/.test(v);
      },
      message: props => `${props.value} is not a valid amount. Please use up to two decimal places.`
    }
  },
  remaining: {
    type: Number,
    required: true
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["active", "complete"],
    default: "active"
  }
}, { timestamps: true });

// Schema-level validation for comparing fields
loanSchema.pre('save', function(next) {
  // Check 1: Installment amount should not exceed the principal
  if (this.installment_amount > this.principal) {
    return next(new Error('Installment amount cannot be greater than the principal amount.'));
  }

  // Check 2: End date must be after the start date
  if (this.end_date <= this.start_date) {
    return next(new Error('End date must be after the start date.'));
  }
  
  next();
});

export default mongoose.model("Loan", loanSchema);