import React from 'react';
import { User, LogOut } from 'lucide-react';

const Header = () => {
  const handleLogout = () => {
    // Handle logout logic
    console.log('Logout clicked');
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Company logo and name - Option 3: The Chic Wordmark */}
<div className="flex items-center space-x-4">
    {/* For this to work best, you might need to import a specific serif font like 'Playfair Display' or use a default one */}
    <h1 className="text-2xl font-bold text-gray-900">
        <span className="font-serif tracking-widest">FASHION</span>
        <span className="font-sans text-blue-600 font-medium tracking-normal">Studio</span>
    </h1>
</div>
          {/* Right side - Profile and logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-8 h-8 text-gray-600" />
              <span className="text-gray-700 font-medium">John Doe</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;