import Loan from "../models/Loan.js";
import Employee from "../models/Employee.js";

export const getAllLoans = async (req, res) => {
  try {
    const { employee } = req.query;
    let filter = {};
    
    if (employee) {
      const emp = await Employee.findOne()
        .populate('user_id', 'name')
        .where('user_id.name')
        .regex(new RegExp(employee, 'i'));
      if (emp) filter.employee_id = emp._id;
    }
    
    const loans = await Loan.find(filter)
      .populate({
        path: 'employee_id',
        populate: {
          path: 'user_id',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });
    
    res.json(loans);
  } catch (error) {
    console.error("Error in getAllLoans:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate({
        path: 'employee_id',
        populate: {
          path: 'user_id',
          select: 'name'
        }
      });
    
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    
    res.json(loan);
  } catch (error) {
    console.error("Error in getLoanById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createLoan = async (req, res) => {
  try {
    const loan = new Loan(req.body);
    const savedLoan = await loan.save();
    
    await savedLoan.populate({
      path: 'employee_id',
      populate: {
        path: 'user_id',
        select: 'name'
      }
    });
    
    res.status(201).json(savedLoan);
  } catch (error) {
    console.error("Error in createLoan:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateLoan = async (req, res) => {
  try {
    const updatedLoan = await Loan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate({
      path: 'employee_id',
      populate: {
        path: 'user_id',
        select: 'name'
      }
    });
    
    if (!updatedLoan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    
    res.json(updatedLoan);
  } catch (error) {
    console.error("Error in updateLoan:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteLoan = async (req, res) => {
  try {
    const deletedLoan = await Loan.findByIdAndDelete(req.params.id);
    
    if (!deletedLoan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    
    res.json({ message: "Loan deleted successfully" });
  } catch (error) {
    console.error("Error in deleteLoan:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};