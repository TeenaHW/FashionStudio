 import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShoppingCart, ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import api from "../lib/axios";
import toast from "react-hot-toast";

const CartSidebar = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = "64f123abc456def789012345";

  const fetchCart = async () => {
    try {
      const res = await api.get(`/carts/${userId}`);
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  // Update quantity function with database sync
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      toast.dismiss('qty');
      toast.error('Quantity cannot be less than 1', { id: 'qty' });
      return;
    }
    if (newQuantity > 10) {
      toast.error("Maximum quantity is 10");
      return;
    }

    try {
      // Update database using productId
      await api.put(`/carts/${userId}/items/${productId}`, {
        quantity: newQuantity,
      });

      // Update local state
      const updatedItems = cartItems.map(item =>
        item.productId._id === productId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedItems);

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

      toast.dismiss('cart-update');
      toast.success("Cart item updated", { id: 'cart-update' });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  // Update size/color function with database sync
  const updateSizeColor = async (productId, newSize, newColor) => {
    try {
      // Update database using productId
      await api.put(`/carts/${userId}/items/${productId}`, {
        size: newSize,
        color: newColor,
      });

      // Update local state
      const updatedItems = cartItems.map(item =>
        item.productId._id === productId ? { ...item, size: newSize, color: newColor } : item
      );
      setCartItems(updatedItems);

      // Update localStorage for cart count sync
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const updatedCart = existingCart.map(cartItem => 
        cartItem.productId === productId 
          ? { ...cartItem, size: newSize, color: newColor }
          : cartItem
      );
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      // Trigger cart count refresh in navbar
      window.dispatchEvent(new Event('cartUpdated'));

      toast.dismiss('cart-update');
      toast.success("Cart item updated", { id: 'cart-update' });
    } catch (error) {
      console.error("Error updating size/color:", error);
      toast.error("Failed to update size/color");
    }
  };

  // Handle item removal - same as CartPage with custom dialog
  const handleItemRemove = async (productId, itemName, itemImage) => {
    return new Promise((resolve) => {
      // Create custom confirmation dialog
      const confirmDialog = document.createElement('div');
      confirmDialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      confirmDialog.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
          <div class="flex items-start space-x-4 mb-4">
            <img src="${itemImage}" alt="${itemName}" class="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Are you sure you want to remove ${itemName} from your cart?</h3>
            </div>
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
            toast.dismiss('cart-remove');
            toast.success("Cart item removed", { id: 'cart-remove' });
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

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDiscount = cartItems.reduce(
    (sum, item) => sum + ((item.productId.discount || 0) / 100) * item.price * item.quantity,
    0
  );
  const finalTotal = subtotal - totalDiscount;

  const handleViewCart = () => {
    navigate('/cart');
    onClose();
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty!");
      return;
    }
    // Navigate to order page with cart data
    navigate("/order", { 
      state: { 
        cartItems, 
        subtotal, 
        totalItemDiscount: totalDiscount, 
        totalCouponDiscount: 0, 
        finalTotal, 
        userId 
      } 
    });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 font-sans ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900 font-sans">Your Cart</h2>
            <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full font-sans">
              {cartItems.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 font-sans">YOUR CART IS EMPTY</h3>
                <button
                  onClick={() => {
                    navigate('/products');
                    onClose();
                  }}
                  className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors font-sans"
                >
                  SHOP NOW
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const product = item.productId;
                  const realPrice = item.price;
                  const subtotal = realPrice * item.quantity;
                  const discountAmount = product.discount ? (product.discount / 100) * subtotal : 0;
                  const total = subtotal - discountAmount;
                  const discountPercentage = product.discount || 0;

                  return (
                    <div key={product._id} className="flex items-start space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow font-sans">
                      {/* Product Image */}
                      <div className="relative flex-shrink-0">
                        <img src={product.imageUrl || product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                        {product.discount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            -{product.discount}%
                          </span>
                        )}
                      </div>
                      
                      {/* Product Details and Pricing */}
                      <div className="flex-1 min-w-0">
                        {/* Product Info */}
                        <div className="mb-3">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 font-sans">{product.name}</h3>
                          <p className="text-sm text-gray-600 mb-1 font-sans">{product.category}</p>
                          
                          {/* Size/Color Display Only */}
                          <div className="mb-2">
                            {product.category === 'jewelry' ? (
                              // Jewelry: Show only size if available
                              item.size && (
                                <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-sans">
                                  {item.size}
                                </span>
                              )
                            ) : (
                              // Outfits: Show both color and size if available
                              <div className="flex items-center space-x-2">
                                {item.color && item.color !== "Default" && (
                                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-sans">
                                    {item.color}
                                  </span>
                                )}
                                {item.size && (
                                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-sans">
                                    {item.size}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price and Quantity Row */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm">
                            <span className="text-gray-600 font-sans">Price: </span>
                            <span className="font-medium text-gray-900 font-sans">Rs. {realPrice.toFixed(2)}</span>
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 font-sans">Qty:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg shadow-sm">
                              <button 
                                onClick={() => updateQuantity(product._id, item.quantity - 1)} 
                                disabled={item.quantity <= 1}
                                className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-3 py-1.5 text-center text-sm font-semibold text-gray-900 min-w-[2.5rem] bg-gray-50">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(product._id, item.quantity + 1)} 
                                disabled={item.quantity >= 10}
                                className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Subtotal and Discount */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 font-sans">Subtotal:</span>
                            <span className="text-sm font-medium text-blue-600 font-sans">Rs. {subtotal.toFixed(2)}</span>
                          </div>
                          {discountPercentage > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 font-sans">Discount:</span>
                              <span className="text-sm font-medium text-red-600 font-sans">{discountPercentage.toFixed(2)}%</span>
                            </div>
                          )}
                        </div>

                        {/* Total and Delete Button Row */}
                        <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-base font-bold text-gray-900 font-sans">Total:</span>
                            <span className="text-base font-bold text-gray-900 font-sans">Rs. {total.toFixed(2)}</span>
                          </div>
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => handleItemRemove(product._id, product.name, product.imageUrl || product.image)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors ml-2"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer - Only show when cart has items */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-6 space-y-4">
              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900 font-medium">Rs. {subtotal.toFixed(2)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-green-600">Total Savings</span>
                    <span className="text-green-600 font-medium">-Rs. {totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2 font-sans">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">Rs. {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleViewCart}
                  className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors font-sans"
                >
                  View Cart
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors font-sans"
                >
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
