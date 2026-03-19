import React, { useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Order } from '../types';
import { Search, Package, Calendar, MapPin, ExternalLink, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const MyOrders = () => {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const q = query(
        collection(db, 'orders'), 
        where('customer.phone', '==', phone.trim()),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const orderList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(orderList);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'shipped': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-stone-50 text-stone-700 border-stone-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-stone-900 mb-4 tracking-tight">Track Your Orders</h1>
        <p className="text-stone-500">Enter your phone number to see your order history and tracking status.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm mb-12">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input 
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number (e.g. 017XXXXXXXX)"
              className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="bg-stone-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <span>SEARCH</span>}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {loading ? (
          [1, 2].map(i => <div key={i} className="h-48 bg-stone-100 animate-pulse rounded-3xl" />)
        ) : orders.length > 0 ? (
          orders.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm"
            >
              <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">Order Number</div>
                  <div className="text-xl font-bold text-stone-900">{order.orderNumber}</div>
                </div>
                <div className={`px-4 py-1.5 rounded-full border text-sm font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                  {order.status}
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-stone-500">
                    <Calendar size={18} />
                    <span className="text-sm font-medium">
                      {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'PPP') : 'Recently'}
                    </span>
                  </div>
                  <div className="flex items-start space-x-3 text-stone-500">
                    <MapPin size={18} className="mt-1" />
                    <span className="text-sm font-medium">
                      {order.customer.address.village}, {order.customer.address.thana}, {order.customer.address.district}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-4">Items</div>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-stone-700 font-medium">
                          {item.qty}x {item.name} {item.size && `(${item.size})`}
                        </span>
                        <span className="text-stone-900 font-bold">৳{(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-stone-100 flex justify-between items-center">
                      <span className="font-bold text-stone-900">Total Paid</span>
                      <span className="text-lg font-bold text-stone-900">৳{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {order.trackingLink && (
                <div className="bg-emerald-50 p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-emerald-800">
                    <Package size={20} />
                    <span className="font-bold text-sm">Your order has a tracking link!</span>
                  </div>
                  <a 
                    href={order.trackingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-emerald-600 font-bold text-sm hover:underline"
                  >
                    <span>Track Now</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </motion.div>
          ))
        ) : hasSearched && (
          <div className="text-center py-20 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
            <div className="text-stone-300 mb-4"><Package size={48} className="mx-auto" /></div>
            <h3 className="text-xl font-bold text-stone-900">No orders found</h3>
            <p className="text-stone-500">We couldn't find any orders associated with this phone number.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
