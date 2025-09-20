import Payment from "../models/Payment.js";

// Create a new simulated payment
export async function createPayment(req, res) {
  try {
    const { orderId, method, amount } = req.body;

    // Generate a fake transaction ID for simulation
    const transactionId = "TXN" + Math.floor(Math.random() * 1000000000);

    // Create new payment document
    const payment = new Payment({
      orderId,
      method,
      amount,
      status: "success", // Simulated payment is always successful
      transactionId,
    });

    const savedPayment = await payment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    console.error("Error in createPayment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get payment by Payment ID
export async function getPaymentById(req, res) {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json(payment);
  } catch (error) {
    console.error("Error in getPaymentById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Optional: Get payment by Order ID
export async function getPaymentByOrder(req, res) {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json(payment);
  } catch (error) {
    console.error("Error in getPaymentByOrder:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Optional: Update payment status (if needed)
export async function updatePaymentStatus(req, res) {
  try {
    const { status } = req.body;
    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updatedPayment) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json(updatedPayment);
  } catch (error) {
    console.error("Error in updatePaymentStatus:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
