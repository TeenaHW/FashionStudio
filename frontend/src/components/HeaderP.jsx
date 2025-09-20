import { Link } from "react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-base-300 border-b border-base-content/10 relative">
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between">
          
          {/* Left side: Menu + Dashboard */}
          <div className="flex items-center">
            {/* Menu pinned to far left */}
            <button 
              className="btn btn-ghost p-2 mr-20"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="size-6" />
            </button>

            {/* Dashboard text with some spacing */}
            <h3 className="text-3xl font-bold text-primary font-mono tracking-tight">
              Inventory 
            </h3>
          </div>

          {/* Right side: currently empty */}
          <div className="flex items-center gap-4">
            {/* Removed the New Item button */}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300
        ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-lg font-bold">Menu</h2>
          <button onClick={() => setIsMenuOpen(false)} className="btn btn-ghost">X</button>
        </div>

        <nav className="flex flex-col gap-4 p-4">
            <Link to="/" className="hover:text-primary">Home</Link>
          <Link to="/create" className="hover:text-primary">Create</Link>
          <Link to="/order" className="hover:text-primary">Order</Link>
          <Link to="/transaction" className="hover:text-primary">Transaction</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

