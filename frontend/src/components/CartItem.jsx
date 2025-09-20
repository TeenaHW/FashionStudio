import React, { useState } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import api from "../lib/axios";
import toast from "react-hot-toast";

const CartItem = ({ item, handleQuantityUpdate, handleItemRemove }) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const userId = "64f123abc456def789012345";

  const handleRemove = async () => {
    setIsDeleting(true);
    await handleItemRemove(item.productId._id, item.productId.name, item.productId.imageUrl || item.productId.image);
    setIsDeleting(false);
  };

  const handleQuantityChange = async (newQuantity) => {
    setIsUpdating(true);
    setQuantity(newQuantity);
    await handleQuantityUpdate(item.productId._id, newQuantity);
    setIsUpdating(false);
  };

  // Update size/color function with database sync
  const updateSizeColor = async (productId, newSize, newColor) => {
    try {
      // Update database using productId
      await api.put(`/carts/${userId}/items/${productId}`, {
        size: newSize,
        color: newColor,
      });

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

      toast.success("✅ Size/Color updated");
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error updating size/color:", error);
      toast.error("Failed to update size/color");
    }
  };

  const product = item.productId;
  const realPrice = item.price; // Original price per item
  const discountPercentage = product.discount || 0;
  const discountAmount = (discountPercentage / 100) * realPrice * quantity;
  const subtotal = realPrice * quantity;
  const total = subtotal - discountAmount;

  return (
    <div className="flex items-start space-x-4 p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow font-sans relative">
      {/* Product Image */}
      <div className="relative flex-shrink-0">
        <img
          src={product.imageUrl || product.image}
          alt={product.name}
          className="w-24 h-24 object-cover rounded-lg"
        />
        {product.discount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 font-sans">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-2 font-sans">{product.category}</p>
          <p className="text-sm text-gray-700 mb-3 font-sans">{product.description}</p>
          
          {/* Size/Color Dropdown Display */}
          <div className="mb-3">
            {product.category === 'jewelry' ? (
              // Jewelry: Show only size dropdown with current selection
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 font-sans">Size:</label>
                <select 
                  className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full max-w-[150px]"
                  value={item.size || 'One Size'}
                  onChange={(e) => {
                    updateSizeColor(product._id, e.target.value, item.color || 'Default');
                  }}
                >
                  <option value="One Size">One Size</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </select>
              </div>
            ) : (
              // Outfits: Show both color and size dropdowns with current selections
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 font-sans">Color:</label>
                  <select 
                    className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                    value={item.color || 'Default'}
                    onChange={(e) => {
                      updateSizeColor(product._id, item.size || 'M', e.target.value);
                    }}
                  >
                    <option value="Default">Default</option>
                    <option value="Black">Black</option>
                    <option value="White">White</option>
                    <option value="Blue">Blue</option>
                    <option value="Baby Blue">Baby Blue</option>
                    <option value="Navy Blue">Navy Blue</option>
                    <option value="Light Blue">Light Blue</option>
                    <option value="Red">Red</option>
                    <option value="Green">Green</option>
                    <option value="Yellow">Yellow</option>
                    <option value="Pink">Pink</option>
                    <option value="Purple">Purple</option>
                    <option value="Gray">Gray</option>
                    <option value="Brown">Brown</option>
                    <option value="Orange">Orange</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 font-sans">Size:</label>
                  <select 
                    className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                    value={item.size || 'M'}
                    onChange={(e) => {
                      updateSizeColor(product._id, e.target.value, item.color || 'Default');
                    }}
                  >
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Left Side Pricing Information */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 font-sans">Price:</span>
            <span className="text-sm font-medium text-gray-900 font-sans">Rs. {realPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 font-sans">Quantity:</span>
            <span className="text-sm font-medium text-gray-900 font-sans">{quantity}</span>
          </div>
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
          <div className="flex justify-between items-center border-t border-gray-200 pt-2">
            <span className="text-base font-bold text-gray-900 font-sans">Total:</span>
            <span className="text-base font-bold text-gray-900 font-sans">Rs. {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end space-y-3">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={isUpdating || quantity <= 1}
            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-4 h-4 text-gray-600" />
          </button>
          
          <span className="px-4 py-2 text-center font-medium text-gray-900 min-w-[3rem] font-sans">
            {isUpdating ? "..." : quantity}
          </span>
          
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={isUpdating || quantity >= 10}
            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Delete Button - Positioned absolutely at bottom right */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={handleRemove}
          disabled={isDeleting}
          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Remove item"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
