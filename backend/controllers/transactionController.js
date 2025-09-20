// controllers/transactionController.js
import Transaction from "../modules/Transaction.js"; // adjust path if needed

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Public (or protect if needed)
export const createTransaction = async (req, res) => {
  try {
    const { description, total_amount } = req.body;

    // validate required fields
    if (!description || !total_amount) {
      return res.status(400).json({ message: "Description and total_amount are required" });
    }

    // create transaction
    const transaction = new Transaction({
      description,
      total_amount,
    });

    await transaction.save();

    return res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
