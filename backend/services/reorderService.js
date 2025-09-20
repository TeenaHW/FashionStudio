import Order from "../modules/Order.js";
import Product from "../modules/Product.js";

export async function calculateReorderLevel(productId) {
  // Constants
  const leadTimeDays = 5; // adjust as needed
  const safetyStock = 10; // adjust as needed

  // Get all orders containing this product
  const orders = await Order.find({ "items.productId": productId });

  if (orders.length === 0) return; // no orders yet

  // Total quantity sold
  let totalQuantity = 0;
  orders.forEach(order => {
    const item = order.items.find(i => i.productId.toString() === productId.toString());
    if (item) totalQuantity += item.quantity;
  });

  // Calculate number of days
  const firstOrderDate = orders[0].createdAt;
  const lastOrderDate = orders[orders.length - 1].createdAt || new Date();
  const days = Math.max((new Date(lastOrderDate) - new Date(firstOrderDate)) / (1000 * 60 * 60 * 24), 1);

  // Average daily sales
  const averageDailySales = totalQuantity / days;

  // Reorder level formula
  const reorderLevel = averageDailySales * leadTimeDays + safetyStock;

  // Update product
  const product = await Product.findById(productId);
  if (!product) return;
  product.reorderLevel = reorderLevel;
  await product.save();

  return reorderLevel;
}
