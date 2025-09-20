import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CartSidebar from "../components/CartSidebar";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showSizeError, setShowSizeError] = useState(false);
  const [showColorError, setShowColorError] = useState(false);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);

  // Check if product has colors to show color selection
  const hasColors = product?.colors?.length > 0;

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          
          // Process colors and sizes
          if (data.colors?.length > 0) {
            // Get all unique sizes with stock > 0
            const sizes = new Set();
            const colors = [];
            
            data.colors.forEach(color => {
              if (color.sizes?.length > 0) {
                const availableSizes = color.sizes
                  .filter(size => size.quantity > 0)
                  .map(size => size.label);
                
                if (availableSizes.length > 0) {
                  colors.push({
                    name: color.name,
                    sizes: availableSizes
                  });
                  
                  availableSizes.forEach(size => sizes.add(size));
                }
              }
            });
            
            setAvailableSizes(Array.from(sizes));
            setAvailableColors(colors);
            
            // Set default color if only one exists
            if (colors.length === 1) {
              setSelectedColor(colors[0].name);
            }
          }
        } else {
          console.error('Product not found');
          navigate('/products');
        }
      } catch (error) {
        console.error('Error loading product:', error);
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    if (id) loadProduct();
  }, [id, navigate]);

  // Update available sizes when color changes
  useEffect(() => {
    if (selectedColor && product?.colors) {
      const colorData = product.colors.find(c => c.name === selectedColor);
      if (colorData?.sizes) {
        const inStockSizes = colorData.sizes
          .filter(size => size.quantity > 0)
          .map(size => size.label);
        
        setAvailableSizes(inStockSizes);
        
        // Reset size if not available in selected color
        if (!inStockSizes.includes(selectedSize)) {
          setSelectedSize("");
        }
      }
    }
  }, [selectedColor, product, selectedSize]);

  // Load favorites
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(id));
  }, [id]);

  // Toggle favorite
  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const updatedFavorites = isFavorite
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];
    
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setIsFavorite(!isFavorite);
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  // Add to cart
  const handleAddToCart = async () => {
    if (!selectedSize) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 3000);
      return;
    }

    if (hasColors && !selectedColor) {
      setShowColorError(true);
      setTimeout(() => setShowColorError(false), 3000);
      return;
    }

    const cartItem = {
      id: product._id,
      productId: product._id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      size: selectedSize,
      color: selectedColor || "Default",
      quantity: quantity,
      category: product.category,
      discount: product.discount || 0
    };

    // Add to database
    try {
      const userId = "64f123abc456def789012345";
      await fetch(`/api/carts/${userId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          quantity,
          size: selectedSize,
          color: selectedColor || "Default",
          price: product.price
        }),
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }

    // Update local storage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex(
      item => item.id === product._id && 
             item.size === selectedSize && 
             item.color === (selectedColor || "Default")
    );

    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(existingCart));
    toast.success('Added to cart!');
    window.dispatchEvent(new Event('cartUpdated'));
    setIsCartSidebarOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Product Image */}
          <div className="mb-8 lg:mb-0">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-[600px] object-cover object-center"
              />
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-indigo-600">
                  Rs. {product.price?.toLocaleString()}
                </span>
                {product.discount > 0 && (
                  <span className="text-sm text-gray-500 line-through">
                    Rs. {product.unitPrice?.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6 flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${
                  product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                <span className="text-sm font-medium">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Color Selection - Show if product has colors */}
              {hasColors && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map(color => (
                      <button
                        key={color.name}
                        onClick={() => {
                          setSelectedColor(color.name);
                          setSelectedSize(""); // Reset size when color changes
                        }}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color.name
                            ? 'ring-2 ring-offset-2 ring-indigo-500'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.name.toLowerCase() }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  {showColorError && (
                    <p className="mt-2 text-sm text-red-600">Please select a color</p>
                  )}
                </div>
              )}

              {/* Size Selection */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Size</h3>
                  {hasColors && selectedColor && (
                    <button
                      onClick={() => setSelectedColor("")}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Change Color
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {availableSizes.length > 0 ? (
                    availableSizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 px-4 text-center border-2 rounded-lg font-medium transition-all ${
                          selectedSize === size
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 scale-105'
                            : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                        }`}
                      >
                        {size}
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500">
                      {hasColors && !selectedColor 
                        ? "Select a color to see available sizes" 
                        : "No sizes available"}
                    </p>
                  )}
                </div>
                {showSizeError && (
                  <p className="mt-2 text-sm text-red-600">Please select a size</p>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors ${
                    product.stock === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
                  }`}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>

                <button
                  onClick={toggleFavorite}
                  className="w-full py-3 px-6 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  {isFavorite ? (
                    <>
                      <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      Remove from Favorites
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Add to Favorites
                    </>
                  )}
                </button>
              </div>
            </div>
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

export default ProductDetails;