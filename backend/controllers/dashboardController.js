import SalaryRecord from "../models/SalaryRecord.js";
import SupplierTransaction from "../models/SupplierTransaction.js";
import Payment from "../models/Payment.js";

export const getDashboardKPIs = async (req, res) => {
  try {
    // Total Revenue
    const totalRevenue = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$final_amount" } } }
    ]);
    
    // Total Expenses (Paid salaries + Paid supplier transactions)
    const paidSalaries = await SalaryRecord.aggregate([
      { $match: { payment_status: "paid" } },
      { $group: { _id: null, total: { $sum: "$net_salary" } } }
    ]);
    
    const paidSupplierTransactions = await SupplierTransaction.aggregate([
      { $match: { paid_status: "Paid" } },
      { $group: { _id: null, total: { $sum: "$total_amount" } } }
    ]);
    
    const revenue = totalRevenue[0]?.total || 0;
    const salaryExpenses = paidSalaries[0]?.total || 0;
    const supplierExpenses = paidSupplierTransactions[0]?.total || 0;
    const totalExpenses = salaryExpenses + supplierExpenses;
    const netProfit = revenue - totalExpenses;
    
    res.json({
      totalRevenue: revenue,
      totalExpenses,
      netProfit
    });
  } catch (error) {
    console.error("Error in getDashboardKPIs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMonthlySales = async (req, res) => {
  try {
    const monthlySales = await Payment.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: "$final_amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);
    
    res.json(monthlySales);
  } catch (error) {
    console.error("Error in getMonthlySales:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getExpensesBreakdown = async (req, res) => {
  try {
    const monthlyExpenses = await SalaryRecord.aggregate([
      { $match: { payment_status: "paid" } },
      {
        $group: {
          _id: {
            year: { $year: "$updatedAt" },
            month: { $month: "$updatedAt" }
          },
          salaries: { $sum: "$net_salary" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);
    
    const monthlySupplierExpenses = await SupplierTransaction.aggregate([
      { $match: { paid_status: "Paid" } },
      {
        $group: {
          _id: {
            year: { $year: "$paid_date" },
            month: { $month: "$paid_date" }
          },
          suppliers: { $sum: "$total_amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);
    
    res.json({ monthlyExpenses, monthlySupplierExpenses });
  } catch (error) {
    console.error("Error in getExpensesBreakdown:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};