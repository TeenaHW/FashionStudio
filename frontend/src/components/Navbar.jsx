import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Search, Heart, User } from "lucide-react";
import api from "../lib/axios";
import CartSidebar from "./CartSidebar";
import FavoritesSidebar from "./FavoritesSidebar";

const Navbar = () => {
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);
  const userId = "64f123abc456def789012345";
  const location = useLocation();
  const [favOpen, setFavOpen] = useState(false);

  const fetchCartCount = async () => {
    try {
      const res = await api.get(`/carts/${userId}`);
      const totalItems = res.data.items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
    } catch (err) {
      console.error("Failed to fetch cart count");
    }
  };

  const fetchFavoriteCount = () => {
    try {
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavoriteCount(Array.isArray(favs) ? favs.length : 0);
    } catch {
      setFavoriteCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
    fetchFavoriteCount();
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    const handleFavUpdate = () => fetchFavoriteCount();
    window.addEventListener('favoritesUpdated', handleFavUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('favoritesUpdated', handleFavUpdate);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Add navigation or filtering logic here
    }
  };

  const handleCartClick = () => {
    // If on cart page, navigate to cart instead of opening sidebar
    if (location.pathname === '/cart') {
      return; // Do nothing, already on cart page
    }
    setIsCartSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsCartSidebarOpen(false);
    // Refresh cart count when sidebar closes
    fetchCartCount();
  };

  return (
    <>
      <header className="bg-white text-gray-900 border-b shadow-sm py-3 px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Section */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-extrabold tracking-widest text-gray-900">FASHION</span>
            <span className="text-2xl md:text-3xl font-extrabold text-blue-600">Studio</span>
          </Link>
        </div>

        {/* Center Section - Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-white border rounded-full px-4 py-2 w-full max-w-md mx-auto shadow-sm"
        >
          <Search size={20} className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-gray-800 placeholder-gray-500 outline-none w-full text-sm"
          />
        </form>

        {/* Right Section - Profile, Favorites, Cart */}
        <div className="flex items-center gap-4">
          <button className="text-gray-700 hover:text-black">
            <User size={24} />
          </button>
          <button className="relative text-gray-700 hover:text-black" onClick={() => setFavOpen(true)}>
            <Heart size={24} />
            {favoriteCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
                {favoriteCount}
              </span>
            )}
          </button>
          <button 
            onClick={handleCartClick}
            className="relative text-gray-700 hover:text-black"
          >
            <ShoppingCart size={26} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Sidebars */}
      {location.pathname !== '/cart' && (
        <CartSidebar 
          isOpen={isCartSidebarOpen} 
          onClose={handleCloseSidebar}
        />
      )}
      <FavoritesSidebar isOpen={favOpen} onClose={() => setFavOpen(false)} />
    </>
  );
};

export default Navbar;
