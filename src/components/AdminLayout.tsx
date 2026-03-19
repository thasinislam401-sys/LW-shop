import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Package, LogOut, Plus, 
  ChevronRight, Menu, X, Clock, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebase';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('isAdmin');
      navigate('/admin-login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'Orders' },
    { path: '/admin/history', icon: <Clock size={20} />, label: 'Monthly History' },
    { path: '/admin/banners', icon: <ImageIcon size={20} />, label: 'Home Banners' },
    { path: '/admin/products-list', icon: <Package size={20} />, label: 'Products' },
    { path: '/admin/add-product', icon: <Plus size={20} />, label: 'Add Product' },
  ];

  return (
    <div className="min-h-screen bg-leather-50 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-leather-900 text-leather-200 p-6 flex flex-col hidden lg:flex border-r border-leather-800">
        <div className="text-white font-bold text-xl mb-10 tracking-tighter font-serif">
          LW <span className="text-gold-500">ADMIN</span>
        </div>
        
        <nav className="flex-grow space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path 
                  ? 'bg-gold-500 text-leather-900 font-bold' 
                  : 'hover:bg-leather-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {location.pathname === item.path && <ChevronRight size={16} />}
            </Link>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 hover:bg-red-900/20 hover:text-red-400 rounded-xl transition-all mt-auto"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-leather-900 text-white p-4 flex justify-between items-center border-b border-leather-800">
        <div className="text-white font-bold text-xl tracking-tighter font-serif">
          LW <span className="text-gold-500">ADMIN</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="lg:hidden fixed inset-0 z-40 bg-leather-900 p-6 pt-20 flex flex-col"
          >
            <nav className="space-y-4">
              {menuItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-4 rounded-xl transition-all ${
                    location.pathname === item.path 
                      ? 'bg-gold-500 text-leather-900 font-bold' 
                      : 'text-leather-200 hover:bg-leather-800'
                  }`}
                >
                  {item.icon}
                  <span className="text-lg">{item.label}</span>
                </Link>
              ))}
            </nav>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-4 text-red-400 hover:bg-red-900/20 rounded-xl transition-all mt-auto"
            >
              <LogOut size={20} />
              <span className="text-lg font-medium">Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold text-leather-900 font-serif">{title}</h1>
            <div className="hidden sm:flex items-center space-x-4">
              <span className="text-sm text-leather-500 font-medium">Admin Panel</span>
              <div className="w-10 h-10 bg-gold-100 text-gold-600 rounded-full flex items-center justify-center font-bold border border-gold-200">A</div>
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
