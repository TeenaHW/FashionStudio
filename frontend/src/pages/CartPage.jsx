import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Tag, Percent, ShoppingCart } from "lucide-react";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import api from "../lib/axios";
import toast from "react-hot-toast";

const CartPage = () => {
  const userId = "64f123abc456def789012345"; // Replace with dynamic userId
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await api.get(`/carts/${userId}`);
      setCartItems(res.data.items || []);
    } catch (err) {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemDiscount = cartItems.reduce(
    (sum, item) => sum + ((item.productId.discount || 0) / 100) * item.price * item.quantity,
    0
  );
  const totalCouponDiscount = (couponDiscount / 100) * (subtotal - totalItemDiscount);
  const finalTotal = subtotal - totalItemDiscount - totalCouponDiscount;

  // Apply coupon
  const applyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    
    const upperCouponCode = couponCode.toUpperCase();
    if (upperCouponCode === "SAVE10") {
      setCouponDiscount(10);
      setAppliedCoupon(upperCouponCode);
      toast.success("Coupon applied: 10% OFF");
    } else if (upperCouponCode === "WELCOME15") {
      setCouponDiscount(15);
      setAppliedCoupon(upperCouponCode);
      toast.success("Coupon applied: 15% OFF");
    } else if (upperCouponCode === "FASHION20") {
      setCouponDiscount(20);
      setAppliedCoupon(upperCouponCode);
      toast.success("Coupon applied: 20% OFF");
    } else {
      setCouponDiscount(0);
      setAppliedCoupon("");
      toast.error("Invalid coupon code");
    }
  };

  const removeCoupon = () => {
    setCouponDiscount(0);
    setAppliedCoupon("");
    setCouponCode("");
    toast.success("Coupon removed");
  };

  // Handle quantity update
  const handleQuantityUpdate = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    if (newQuantity > 10) {
      toast.error("Maximum quantity is 10");
      return;
    }

    try {
      await api.put(`/carts/${userId}/items/${productId}`, { quantity: newQuantity });
      
      // Update localStorage for cart count sync
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const updatedCart = existingCart.map(cartItem => 
        cartItem.productId === productId 
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      );
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Trigger cart count refresh in navbar
      window.dispatchEvent(new Event('cartUpdated'));
      
      await fetchCart(); // Refresh cart data
      toast.success("✅ Cart item updated");
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  };

  // Handle item removal with custom confirmation dialog
  const handleItemRemove = async (productId, itemName) => {
    return new Promise((resolve) => {
      // Create custom confirmation dialog
      const confirmDialog = document.createElement('div');
      confirmDialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      confirmDialog.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
          <div class="text-center mb-6">
            <h3 class="text-lg font-medium text-gray-900">Do you want to delete this item?</h3>
          </div>
          <div class="flex space-x-3">
            <button id="confirm-no" class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium">NO</button>
            <button id="confirm-yes" class="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 font-medium">YES</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(confirmDialog);
      
      const handleConfirm = async (confirmed) => {
        document.body.removeChild(confirmDialog);
        
        if (confirmed) {
          try {
            await api.delete(`/carts/${userId}/items/${productId}`);
            
            // Update localStorage for cart count sync
            const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
            const updatedCart = existingCart.filter(cartItem => cartItem.productId !== productId);
            localStorage.setItem('cart', JSON.stringify(updatedCart));
            
            // Trigger cart count refresh in navbar
            window.dispatchEvent(new Event('cartUpdated'));
            
            await fetchCart(); // Refresh cart data
            toast.success("✅ Cart item removed");
          } catch (err) {
            toast.error("Failed to remove item");
          }
        }
        resolve(confirmed);
      };
      
      document.getElementById('confirm-yes').onclick = () => handleConfirm(true);
      document.getElementById('confirm-no').onclick = () => handleConfirm(false);
      confirmDialog.onclick = (e) => {
        if (e.target === confirmDialog) handleConfirm(false);
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <nav className="flex items-center text-sm text-gray-500 mb-6">
            <button 
              onClick={() => navigate('/products')} 
              className="hover:text-gray-700 transition-colors flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Home
            </button>
            <span className="mx-3">/</span>
            <span className="text-gray-900 font-medium">Shopping Cart</span>
          </nav>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 font-serif">My Cart</h1>
           
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-6"></div>
              <p className="text-gray-600 text-lg font-medium">Loading your cart...</p>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-8">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-16 h-16 text-gray-400" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Your cart is empty</h3>
            <p className="text-gray-600 mb-8 text-lg">Discover our amazing collection and add items to your cart</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full mr-3">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                  </span>
                  Cart Items
                </h2>
                
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.productId._id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <CartItem
                        item={item}
                        userId={userId}
                        refreshCart={fetchCart}
                        handleQuantityUpdate={handleQuantityUpdate}
                        handleItemRemove={() => handleItemRemove(item.productId._id, item.productId.name)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                {/* Coupon Section */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-3">
                    <Tag className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-medium text-gray-900">Apply Coupon</h3>
                  </div>
                  
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <Percent className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-green-800 font-medium">{appliedCoupon}</span>
                        <span className="text-green-600 text-sm ml-2">({couponDiscount}% OFF)</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={applyCoupon}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Apply Coupon
                      </button>
                      <div className="text-xs text-gray-500">
                        Try: SAVE10, WELCOME15, FASHION20
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  
                  {totalItemDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center">
                        <Percent className="w-4 h-4 mr-1" />
                        Item Discounts
                      </span>
                      <span className="font-medium">-Rs. {totalItemDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span className="flex items-center">
                        <Tag className="w-4 h-4 mr-1" />
                        Coupon Discount ({couponDiscount}%)
                      </span>
                      <span className="font-medium">-Rs. {totalCouponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span>Rs. {finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Continue Shopping Button */}
                <button
                  onClick={() => navigate('/products')}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center mb-3"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Continue Shopping
                </button>

                {/* Place Order Button */}
                <button
                  onClick={() => {
                    if (cartItems.length === 0) {
                      toast.error("Cart is empty!");
                      return;
                    }
                    navigate("/order", { 
                      state: { 
                        cartItems, 
                        subtotal, 
                        totalItemDiscount, 
                        totalCouponDiscount, 
                        finalTotal, 
                        userId 
                      } 
                    });
                  }}
                  className="w-full bg-gray-900 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
