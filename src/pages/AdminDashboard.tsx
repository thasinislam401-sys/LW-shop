import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Order, Product } from '../types';
import { 
  ShoppingBag, Package, TrendingUp, 
  Clock, ArrowRight, Database
} from 'lucide-react';
import { motion } from 'framer-motion';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(10));
    const productsQuery = query(collection(db, 'products'));

    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    });

    const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    });

    return () => {
      unsubOrders();
      unsubProducts();
    };
  }, [isAdmin]);

  const seedDemoProducts = async () => {
    if (!window.confirm('Add demo Chelsea Boots to inventory?')) return;
    setSeeding(true);
    try {
      const demoProducts = [
        {
          name: 'Classic Leather Chelsea Boot',
          price: 4500,
          category: 'Chelsea Boot',
          description: '<h1>Premium Quality Chelsea Boots</h1><p>Timeless Chelsea boots crafted from <strong>premium full-grain leather</strong>. Features a durable rubber sole and elastic side panels for a perfect fit.</p><ul><li>100% Genuine Leather</li><li>Durable Rubber Sole</li><li>Handcrafted Finish</li></ul>',
          images: ['https://images.unsplash.com/photo-1542838686-37da4a9fd1b3?auto=format&fit=crop&q=80&w=800'],
          sizes: ['40', '41', '42', '43', '44'],
          colors: ['Black', 'Chocolate'],
          inStock: true,
          featured: true
        },
        {
          name: 'Premium Tassel Loafer',
          price: 3500,
          category: 'Loafer Shoe',
          description: '<h2>Elegant Tassel Loafers</h2><p>Sophisticated tassel loafers made from <strong>high-quality leather</strong>. Hand-stitched details and a comfortable cushioned insole.</p><blockquote>Perfect for both formal and semi-formal occasions.</blockquote>',
          images: ['https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=800'],
          sizes: ['39', '40', '41', '42', '43'],
          colors: ['Brown', 'Black'],
          inStock: true,
          featured: true
        },
        {
          name: 'Classic Oxford Brogue',
          price: 4800,
          category: 'Oxford Shoe',
          description: 'Formal Oxford shoes with traditional brogue detailing. Perfect for weddings, business meetings, and formal events.',
          images: ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=800'],
          sizes: ['40', '41', '42', '43', '44'],
          colors: ['Tan', 'Black'],
          inStock: true,
          featured: false
        },
        {
          name: 'Leather Cross-Strap Sandals',
          price: 1800,
          category: 'Sandals',
          description: 'Comfortable and stylish leather sandals for everyday wear. Features a soft footbed and adjustable straps.',
          images: ['https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&q=80&w=800'],
          sizes: ['38', '39', '40', '41', '42'],
          colors: ['Brown', 'Black'],
          inStock: true,
          featured: false
        },
        {
          name: 'Minimalist Casual Sneaker',
          price: 3200,
          category: 'Casual Shoe',
          description: 'Clean and minimalist casual shoes crafted from soft leather. Lightweight sole for maximum comfort during long walks.',
          images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800'],
          sizes: ['40', '41', '42', '43', '44'],
          colors: ['White', 'Navy'],
          inStock: true,
          featured: false
        }
      ];

      for (const product of demoProducts) {
        await addDoc(collection(db, 'products'), {
          ...product,
          createdAt: serverTimestamp()
        });
      }
      alert('Demo products added successfully!');
    } catch (error) {
      console.error('Seeding error:', error);
      alert('Failed to add demo products');
    } finally {
      setSeeding(false);
    }
  };

  if (!isAdmin) return <Navigate to="/admin-login" />;

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    totalProducts: products.length
  };

  return (
    <AdminLayout title="Dashboard">
      {/* Quick Actions */}
      <div className="mb-8 flex justify-end">
        <button 
          onClick={seedDemoProducts}
          disabled={seeding}
          className="flex items-center gap-2 px-4 py-2 bg-leather-900 text-white rounded-xl font-bold text-sm hover:bg-leather-800 transition-all disabled:opacity-50"
        >
          <Database size={16} />
          {seeding ? 'Adding...' : 'Seed Demo Products'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Orders', value: stats.totalOrders, icon: <ShoppingBag className="text-leather-600" />, bg: 'bg-leather-50', link: '/admin/orders' },
          { label: 'Pending Orders', value: stats.pendingOrders, icon: <Clock className="text-amber-600" />, bg: 'bg-amber-50', link: '/admin/orders' },
          { label: 'Total Products', value: stats.totalProducts, icon: <Package className="text-leather-600" />, bg: 'bg-leather-100', link: '/admin/products-list' }
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-leather-100 shadow-sm relative group"
          >
            {stat.link && (
              <Link to={stat.link} className="absolute inset-0 z-10" />
            )}
            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <div className="text-sm text-leather-500 font-bold uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-2xl font-bold text-leather-900">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-3xl border border-leather-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-leather-50 flex justify-between items-center bg-leather-50/30">
          <h2 className="text-xl font-bold text-leather-900 font-serif">Recent Orders</h2>
          <Link to="/admin/orders" className="text-gold-600 font-bold text-sm hover:underline flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-leather-50 text-leather-400 text-xs font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Order #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-leather-50">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-leather-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-leather-900">{order.orderNumber}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-leather-900">{order.customer.name}</div>
                    <div className="text-xs text-leather-500">{order.customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-leather-900">৳{order.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                      'bg-gold-100 text-gold-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/admin/orders`} className="text-leather-400 hover:text-gold-600 transition-colors">
                      <ArrowRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-leather-400">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
