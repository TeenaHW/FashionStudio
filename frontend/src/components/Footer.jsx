import React from 'react';

const Footer = () => {
  return (
    // Add ml-64 to push the footer to the right, avoiding the sidebar
    <footer className="bg-gray-800 text-white py-8 ml-64"> 
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info - Option 3: The Chic Wordmark */}
<div>
  {/* The Wordmark Logo */}
  <div className="mb-4">
    <h3 className="text-xl font-bold text-white">
      {/* Ensure you use a contrasting color like 'text-white' for the main part on a dark footer */}
      <span className="font-serif tracking-widest">FASHION</span>
      {/* A slightly brighter blue like 'text-blue-400' often looks better on dark backgrounds */}
      <span className="font-sans text-blue-400 font-medium tracking-normal">Studio</span>
    </h3>
  </div>
  
  {/* The Description */}
  <p className="text-gray-300 mb-2 max-w-xs"> 
    {/* max-w-xs is added to control the line length for better readability */}
    Leading fashion retailer providing quality clothing and accessories.
  </p>
</div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
            <div className="space-y-2 text-gray-300">
              <p>📍 123 Fashion Street, Colombo 01, Sri Lanka</p>
              <p>📞 +94 11 1234567</p>
              <p>📧 info@fashionstudio.lk</p>
              <p>🌐 www.fashionstudio.lk</p>
            </div>
          </div>

          {/* Business Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Business Hours</h4>
            <div className="space-y-2 text-gray-300">
              <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
              <p>Saturday: 9:00 AM - 5:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; 2025 FashionStudio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;