import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-leather-900 text-leather-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-bold tracking-tighter text-white mb-6 block font-serif">
              LEATHER <span className="text-gold-500">WALLAH</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Premium leather products crafted with passion and precision. Quality you can feel, style you can wear.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/leatherwallah" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors"><Facebook size={20} /></a>
              <a href="https://www.instagram.com/leatherwallahbd/" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors"><Instagram size={20} /></a>
              <a href="https://www.tiktok.com/@leatherwallah" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 font-serif">Quick Links</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/" className="hover:text-gold-400 transition-colors">Home</Link></li>
              <li><Link to="/shop" className="hover:text-gold-400 transition-colors">Shop All</Link></li>
              <li><Link to="/orders" className="hover:text-gold-400 transition-colors">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 font-serif">Categories</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/shop?category=Chelsea Boot" className="hover:text-gold-400 transition-colors">Chelsea Boots</Link></li>
              <li><Link to="/shop?category=Loafer Shoe" className="hover:text-gold-400 transition-colors">Loafers</Link></li>
              <li><Link to="/shop?category=Oxford Shoe" className="hover:text-gold-400 transition-colors">Oxford Shoes</Link></li>
              <li><Link to="/shop?category=Casual Shoe" className="hover:text-gold-400 transition-colors">Casual Shoes</Link></li>
              <li><Link to="/shop?category=Sandals" className="hover:text-gold-400 transition-colors">Sandals</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 font-serif">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center space-x-3">
                <Phone size={16} className="text-gold-500" />
                <span>+880 1956-869107</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={16} className="text-gold-500" />
                <span>leatherwallahbd@gmail.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin size={16} className="text-gold-500 mt-1" />
                <div className="flex flex-col">
                  <span>Dhaka, Hazaribagh</span>
                  <Link 
                    to="/admin-login" 
                    className="mt-2 text-[8px] text-leather-200/10 hover:text-leather-200/30 transition-colors font-bold tracking-widest self-start"
                  >
                    AL
                  </Link>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-leather-800 pt-8 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} Leather Wallah. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
