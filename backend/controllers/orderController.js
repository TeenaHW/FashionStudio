import Order from "../models/Order.js";

// GET all orders for a user
export async function getOrdersByUser(req, res) {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("error in getOrdersByUser controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET single order by ID
export async function getOrderById(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    console.error("error in getOrderById controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// CREATE new order
export async function createOrder(req, res) {
  try {
    const order = new Order(req.body);
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("error in createOrder controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// UPDATE order status
export async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: status },
      { new: true }
    );
    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("error in updateOrderStatus controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
