import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react';
import { useCart } from '../CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { cartCount } = useCart();

  return (
    <nav className="sticky top-0 z-50 bg-leather-50/80 backdrop-blur-md border-b border-leather-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-lg sm:text-2xl font-bold tracking-tighter text-leather-900 font-serif whitespace-nowrap">
              LEATHER <span className="text-gold-500">WALLAH</span>
            </Link>
          </div>

          {/* Desktop & Mobile Menu */}
          <div className="flex items-center space-x-3 sm:space-x-8">
            <Link to="/" className="text-[11px] sm:text-base text-leather-700 hover:text-gold-600 transition-colors font-medium">Home</Link>
            <Link to="/shop" className="text-[11px] sm:text-base text-leather-700 hover:text-gold-600 transition-colors font-medium">Shop</Link>
            <Link to="/orders" className="text-[11px] sm:text-base text-leather-700 hover:text-gold-600 transition-colors font-medium">Orders</Link>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-4">
            <Link to="/cart" className="relative p-1.5 sm:p-2 text-leather-700 hover:text-gold-600 transition-colors">
              <ShoppingCart size={18} className="sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-gold-500 text-white text-[8px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full min-w-[14px] sm:min-w-[18px] text-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
