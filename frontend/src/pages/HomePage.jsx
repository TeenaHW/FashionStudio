import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RateLimitedUI from "../components/RateLimitedUI";
import api from "../lib/axios";
import toast from "react-hot-toast";
import ProductCard from "../components/ProductCard";

const HomePage = () => {
  const navigate = useNavigate();
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const userId = "64f123abc456def789012345"; // replace with dynamic userId

  // Load products from MongoDB database with RateLimitedUI support
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get("/products");
        setProducts(res.data);
        setIsRateLimited(false);
      } catch (error) {
        if (error.response?.status === 429) {
          setIsRateLimited(true);
        } else {
          toast.error("Failed to load products");
        }
      } finally {
        setLoading(false);
      }
    };

    const loadCartItems = () => {
      try {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(savedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        setCartItems([]);
      }
    };

    fetchProducts();
    loadCartItems();
  }, []);

  // Handle product selection
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
  };

  // Filter products by category
  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  // Add to cart function
  const addToCart = async () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    const userId = "64f123abc456def789012345";
    const cartItem = {
      id: selectedProduct._id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
      imageUrl: selectedProduct.imageUrl
    };

    try {
      const response = await fetch(`/api/carts/${userId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct._id,
          quantity: quantity
        }),
      });

      if (response.ok) {
        const updatedCart = [...cartItems, cartItem];
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        alert('Added to cart successfully!');
      } else {
        console.error('❌ Failed to add item to database');
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
    }
  };

  const updateQuantity = (index, newQuantity) => {
    const updatedCart = [...cartItems];
    updatedCart[index].quantity = newQuantity;
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (index) => {
    const updatedCart = [...cartItems];
    updatedCart.splice(index, 1);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      {isRateLimited && <RateLimitedUI />}
      <div className="max-w-7xl mx-auto p-4 mt-6">
        {loading && (
          <div className="text-center text-primary py-10">
            Loading products...
          </div>
        )}
        {!loading && products.length === 0 && !isRateLimited && (
          <div className="text-center text-base-content/70">No products found.</div>
        )}
        
        {!isRateLimited && !selectedProduct && (
          // ProductList View
          <div>
            {/* Category Navigation */}
            <nav className="flex items-center space-x-2 text-sm mb-8">
              {["All", "Dresses", "Outerwear", "Tops", "Bottoms", "Knitwear", "Jewelry", "Footwear"].map((category) => (
                <button 
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium ${
                    selectedCategory === category 
                      ? "bg-pink-500 text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </nav>

            {/* Products Grid */}
            {products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-pink-200"
                    onClick={() => handleProductSelect(product)}
                  >
                    {/* Product Image */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        {product.category}
                      </div>
                      
                      {/* Discount Badge */}
                      {product.originalPrice && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-6 space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                        {product.name}
                      </h3>
                      
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {product.description}
                      </p>
                      
                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-gray-900">
                            LKR {product.price?.toLocaleString()}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              LKR {product.originalPrice?.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductSelect(product);
                          }}
                          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/25 transform hover:scale-105"
                        >
                          View Details
                        </button>
                      </div>
                      
                      {/* Rating Stars */}
                      <div className="flex items-center space-x-1">
                        {[1,2,3,4,5].map((star) => (
                          <span key={star} className={`text-sm ${star <= Math.floor(product.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                        <span className="text-gray-500 text-sm ml-2">({product.rating || 5.0}) · {product.reviews || 0} reviews</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!isRateLimited && selectedProduct && (
          // ProductDetails View
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Product Image */}
              <div className="space-y-4">
                <div className="aspect-square bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl overflow-hidden">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{selectedProduct.name}</h1>
                  <p className="text-gray-600 text-lg">{selectedProduct.description}</p>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-gray-900">
                    LKR {selectedProduct.price?.toLocaleString()}
                  </span>
                  {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                    <span className="text-xl text-gray-500 line-through">
                      LKR {selectedProduct.originalPrice?.toLocaleString()}
                    </span>
                  )}
                  {selectedProduct.discount && (
                    <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                      {selectedProduct.discount}% OFF
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${selectedProduct.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-lg font-medium ${selectedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedProduct.stock > 0 ? `In Stock (${selectedProduct.stock} available)` : 'Out of Stock'}
                  </span>
                </div>

                {/* Size Selection */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Size</h3>
                  <div className="flex space-x-3">
                    {["S", "M", "L", "XL", "XXL"].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-3 border rounded-lg text-lg font-medium transition-colors ${
                          selectedSize === size
                            ? "border-pink-500 bg-pink-500 text-white"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Color</h3>
                  <div className="flex space-x-3">
                    {["Black", "White", "Brown", "Navy", "Gray"].map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-6 py-3 border rounded-lg text-lg font-medium transition-colors ${
                          selectedColor === color
                            ? "border-pink-500 bg-pink-500 text-white"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quantity</h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 text-xl"
                    >
                      -
                    </button>
                    <span className="text-2xl font-medium text-gray-900 w-16 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={addToCart}
                  disabled={selectedProduct.stock === 0}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 text-white py-4 px-8 rounded-xl font-semibold text-xl transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/25 transform hover:scale-105 disabled:transform-none disabled:shadow-none"
                >
                  {selectedProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCartSidebar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl">
            <div className="p-6 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Your Cart</h3>
                <button 
                  onClick={() => setShowCartSidebar(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
              
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🛒</div>
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  cartItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-3">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-600">Size: {item.size}</p>
                        {item.color && <p className="text-xs text-gray-600">Color: {item.color}</p>}
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-semibold text-gray-900 text-sm">
                            LKR {item.price?.toLocaleString()}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1 bg-white border border-gray-300 rounded">
                              <button
                                onClick={() => updateQuantity(index, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l"
                              >
                                -
                              </button>
                              <span className="text-sm font-medium text-gray-900 w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(index, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r"
                              >
                                +
                              </button>
                            </div>
                            <button 
                              onClick={() => removeFromCart(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove item"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between mb-4">
                    <span className="font-medium text-gray-900">Total ({cartItems.reduce((total, item) => total + item.quantity, 0)} items)</span>
                    <span className="font-bold text-gray-900">LKR {cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString()}</span>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setShowCartSidebar(false);
                      navigate('/cart');
                    }}
                    className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors font-medium mb-3"
                  >
                    VIEW CART ({cartItems.reduce((total, item) => total + item.quantity, 0)})
                  </button>
                  
                  <button 
                    onClick={() => setShowCartSidebar(false)}
                    className="w-full border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
