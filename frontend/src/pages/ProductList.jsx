import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CartSidebar from "../components/CartSidebar";
import Navbar from "../components/Navbar";

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);

  // Load products from MongoDB database only
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          } else {
          console.error('❌ Failed to fetch products from database');
          setProducts([]);
        }
      } catch (error) {
        console.error('❌ Error loading products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Get total cart items from localStorage for display
  const getTotalItems = () => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      return savedCart.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      return 0;
    }
  };

  // Filter products by category
  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading beautiful fashion items...</p>
        </div>
      </div>
    );
  }

  // =============================================================================
  // NAVIGATION - This will work with real product IDs from database
  // =============================================================================
  const handleViewDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Navigation */}
            <nav className="flex items-center space-x-2 text-sm">
              <button 
                onClick={() => setSelectedCategory("All")}
                className={`px-4 py-2 rounded-full font-medium ${
                  selectedCategory === "All" 
                    ? "bg-pink-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setSelectedCategory("Dresses")}
                className={`px-4 py-2 rounded-full font-medium ${
                  selectedCategory === "Dresses" 
                    ? "bg-pink-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Dresses
              </button>
              <button 
                onClick={() => setSelectedCategory("Outerwear")}
                className={`px-4 py-2 rounded-full font-medium ${
                  selectedCategory === "Outerwear" 
                    ? "bg-pink-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Outerwear
              </button>
              <button 
                onClick={() => setSelectedCategory("Tops")}
                className={`px-4 py-2 rounded-full font-medium ${
                  selectedCategory === "Tops" 
                    ? "bg-pink-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tops
              </button>
              <button 
                onClick={() => setSelectedCategory("Bottoms")}
                className={`px-4 py-2 rounded-full font-medium ${
                  selectedCategory === "Bottoms" 
                    ? "bg-pink-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Bottoms
              </button>
              <button 
                onClick={() => setSelectedCategory("Knitwear")}
                className={`px-4 py-2 rounded-full font-medium ${
                  selectedCategory === "Knitwear" 
                    ? "bg-pink-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Knitwear
              </button>
              <button 
                onClick={() => setSelectedCategory("Jewelry")}
                className={`px-4 py-2 rounded-full font-medium ${
                  selectedCategory === "Jewelry" 
                    ? "bg-pink-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Jewelry
              </button>
              <button 
                onClick={() => setSelectedCategory("Footwear")}
                className={`px-4 py-2 rounded-full font-medium ${
                  selectedCategory === "Footwear" 
                    ? "bg-pink-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Footwear
              </button>
            </nav>


        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-pink-200"
              onClick={() => handleViewDetails(product._id)}
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
                
                {/* Quick View Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6">
                  <button className="bg-white text-gray-900 px-6 py-2 rounded-full font-semibold text-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-gray-100">
                    Quick View
                  </button>
                </div>
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
                      Rs. {product.price?.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        Rs. {product.originalPrice?.toLocaleString()}
                      </span>
                    )}
                    {product.discount && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        {product.discount}% OFF
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(product._id);
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

        {/* Load More Section */}
        <div className="text-center mt-16">
          <button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/25 transform hover:scale-105">
            Load More Stunning Pieces
          </button>
        </div>

        {/* Fashion Categories Showcase */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl">
            <div className="text-4xl mb-3">👗</div>
            <h3 className="font-bold text-gray-900">Dresses</h3>
            <p className="text-sm text-gray-600">Elegant & Casual</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl">
            <div className="text-4xl mb-3">💍</div>
            <h3 className="font-bold text-gray-900">Jewelry</h3>
            <p className="text-sm text-gray-600">Rings & Necklaces</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl">
            <div className="text-4xl mb-3">👚</div>
            <h3 className="font-bold text-gray-900">Tops</h3>
            <p className="text-sm text-gray-600">Blouses & Shirts</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl">
            <div className="text-4xl mb-3">👠</div>
            <h3 className="font-bold text-gray-900">Footwear</h3>
            <p className="text-sm text-gray-600">Heels & Boots</p>
          </div>
        </div>
      </div>
      
      <CartSidebar 
        isOpen={isCartSidebarOpen} 
        onClose={() => setIsCartSidebarOpen(false)}
      />
    </div>
  );
};

export default ProductList;
