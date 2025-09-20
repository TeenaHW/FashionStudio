const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: false }, // Added mobile field. Set required: true if needed.
  password: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { 
    type: String, 
    enum: ['Male', 'Female', 'Other'], 
    required: true 
  },
  expectedRole: { 
    type: String, 
    enum: ['Admin',  'Customer'],
    required: true 
  },
  createdAt: { type: Date, default: Date.now },
  profileImage: { type: String },
  lastLogin: { type: Date, default: null }
});

// JWT Token Method
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, { expiresIn: "7d" });
  return token;
};

const User = mongoose.model("User", userSchema);

// Validation Function updated with mobile field (optional)
// If you want to make mobile required at registration, change .optional() to .required()
const validate = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().label("Name"),
    email: Joi.string().email().required().label("Email"),
    mobile: Joi.string().optional().label("Mobile Number"), // New mobile field
    password: passwordComplexity().required().label("Password"),
    dob: Joi.date().required().label("Date of Birth"),
    gender: Joi.string().valid("Male", "Female", "Other").required().label("Gender"),
    expectedRole: Joi.string().valid("Admin", "Manager", "Supplier", "Delivery_person", "Customer").required().label("Role")
  });
  return schema.validate(data);
};

module.exports = { User, validate };
