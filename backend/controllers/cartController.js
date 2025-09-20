// controllers/cartController.js
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// GET cart for a user
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate("items.productId");
    if (!cart) return res.status(200).json({ items: [], totalAmount: 0 });
    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ADD item to cart
export const addToCart = async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product || product.stock < quantity) {
      return res.status(400).json({ message: "Product not available or insufficient stock" });
    }

    let cart = await Cart.findOne({ userId });

    const itemPrice = product.price;

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ productId, quantity, price: itemPrice }],
        totalAmount: itemPrice * quantity
      });
    } else {
      const existingItem = cart.items.find(item => item.productId.toString() === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, price: itemPrice });
      }
      cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    await cart.save();
    const populatedCart = await cart.populate("items.productId");
    res.status(201).json(populatedCart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE cart item quantity
export const updateCartItem = async (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(i => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    item.quantity = quantity;
    cart.totalAmount = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    await cart.save();
    const populatedCart = await cart.populate("items.productId");
    res.status(200).json(populatedCart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// REMOVE cart item
export const removeCartItem = async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    cart.totalAmount = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    await cart.save();
    const populatedCart = await cart.populate("items.productId");
    res.status(200).json(populatedCart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
