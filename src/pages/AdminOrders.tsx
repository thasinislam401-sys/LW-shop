import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Order } from '../types';
import { 
  Search, Phone, MessageCircle, 
  Copy, CheckCircle, Truck, Package, X, ChevronDown, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import AdminLayout from '../components/AdminLayout';
import InvoiceModal from '../components/InvoiceModal';

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingLink, setTrackingLink] = useState('');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) || 
                         o.customer.phone.includes(search) ||
                         o.customer.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'shipped' && trackingLink) {
        updateData.trackingLink = trackingLink;
      }
      
      await updateDoc(doc(db, 'orders', orderId), { ...updateData });
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, ...updateData });
        if (newStatus === 'confirmed') {
          setIsInvoiceModalOpen(true);
        }
      }
      
      // Close details after save
      setSelectedOrder(null);
      alert(`Order ${newStatus === 'cancelled' ? 'cancelled' : 'updated'} successfully!`);
    } catch (error) {
      console.error('Update status error:', error);
      alert('Failed to update order.');
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return { id: 'confirmed', label: 'Confirm Order', icon: <CheckCircle size={16} /> };
      case 'confirmed': return { id: 'shipped', label: 'Mark as Shipped', icon: <Truck size={16} /> };
      case 'shipped': return { id: 'delivered', label: 'Mark as Delivered', icon: <Package size={16} /> };
      default: return null;
    }
  };

  const copyToWhatsApp = (order: Order) => {
    const msg = `Order Details:\nID: ${order.orderNumber}\nCustomer: ${order.customer.name}\nPhone: ${order.customer.phone}\nAddress: ${order.customer.address.village}, ${order.customer.address.thana}, ${order.customer.address.district}\nTotal: ৳${order.total}`;
    navigator.clipboard.writeText(msg);
    alert('Order details copied for WhatsApp!');
  };

  return (
    <AdminLayout title="Order Management">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-leather-400" size={18} />
            <input 
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-leather-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-leather-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500 font-medium text-leather-700"
          >
            <option value="All">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-leather-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-leather-50 text-leather-400 text-xs font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Order #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-leather-50">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-leather-50/50 transition-colors cursor-pointer" onClick={() => { setSelectedOrder(order); setTrackingLink(order.trackingLink || ''); }}>
                  <td className="px-6 py-4 font-bold text-leather-900">{order.orderNumber}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-leather-900">{order.customer.name}</div>
                    <div className="text-xs text-leather-500">{order.customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-leather-500">
                    {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM d, p') : 'Recent'}
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
                    <button className="text-leather-400 hover:text-leather-900 transition-colors">
                      <ChevronDown size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-leather-400">
                    No orders found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-leather-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-leather-50 flex justify-between items-center sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-2xl font-bold text-leather-900 font-serif">Order {selectedOrder.orderNumber}</h2>
                  <p className="text-sm text-leather-500">Placed on {selectedOrder.createdAt?.toDate ? format(selectedOrder.createdAt.toDate(), 'PPP p') : 'Recent'}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-leather-50 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 bg-gold-50 border-b border-gold-100 flex justify-between items-center">
                <div className="text-xs font-bold text-gold-700 uppercase tracking-widest">Order Actions</div>
                <button 
                  onClick={() => setIsInvoiceModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-gold-500 text-leather-900 rounded-xl font-bold text-sm hover:bg-gold-600 transition-all shadow-lg shadow-gold-500/20"
                >
                  <Package size={16} />
                  MAKE INVOICE
                </button>
              </div>

              <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Customer & Items */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xs font-bold text-leather-400 uppercase tracking-widest mb-4">Customer Info</h3>
                    <div className="bg-leather-50 p-6 rounded-2xl space-y-4">
                      <div className="flex justify-between">
                        <span className="text-leather-500 text-sm">Name</span>
                        <span className="font-bold text-leather-900">{selectedOrder.customer.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-leather-500 text-sm">Phone</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-leather-900">{selectedOrder.customer.phone}</span>
                          <a href={`tel:${selectedOrder.customer.phone}`} className="p-1.5 bg-white rounded-lg text-leather-400 hover:text-gold-600 shadow-sm border border-leather-100">
                            <Phone size={14} />
                          </a>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-leather-500 text-sm">Address</span>
                        <span className="font-bold text-leather-900 text-right max-w-[200px]">
                          {selectedOrder.customer.address.village}, {selectedOrder.customer.address.thana}, {selectedOrder.customer.address.district}
                        </span>
                      </div>
                      <button 
                        onClick={() => copyToWhatsApp(selectedOrder)}
                        className="w-full flex items-center justify-center space-x-2 py-2.5 bg-white border border-leather-200 rounded-xl text-xs font-bold text-leather-600 hover:bg-leather-100 transition-all"
                      >
                        <Copy size={14} />
                        <span>COPY FOR WHATSAPP</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-leather-400 uppercase tracking-widest mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-white border border-leather-100 rounded-2xl">
                          <div>
                            <div className="font-bold text-leather-900 font-serif">{item.name}</div>
                            <div className="text-xs text-leather-500">
                              Qty: {item.qty} {item.size && `| Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                            </div>
                          </div>
                          <div className="font-bold text-leather-900">৳{(item.price * item.qty).toLocaleString()}</div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-4 px-4">
                        <span className="text-lg font-bold text-leather-900">Total Amount</span>
                        <span className="text-2xl font-bold text-gold-600">৳{selectedOrder.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xs font-bold text-leather-400 uppercase tracking-widest mb-4">Current Status</h3>
                    <div className="p-4 bg-leather-50 rounded-2xl border border-leather-100 mb-6">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          selectedOrder.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          selectedOrder.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          selectedOrder.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                          selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gold-100 text-gold-700'
                        }`}>
                          {selectedOrder.status === 'pending' ? <Clock size={20} /> :
                           selectedOrder.status === 'confirmed' ? <CheckCircle size={20} /> :
                           selectedOrder.status === 'shipped' ? <Truck size={20} /> :
                           selectedOrder.status === 'cancelled' ? <div className="w-5 h-5 flex items-center justify-center font-bold">!</div> :
                           <Package size={20} />}
                        </div>
                        <div>
                          <div className="font-bold text-leather-900 capitalize">{selectedOrder.status}</div>
                          <div className="text-xs text-leather-500">Current order progress</div>
                        </div>
                      </div>
                    </div>

                    {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                      <div className="space-y-6">
                        <h3 className="text-xs font-bold text-leather-400 uppercase tracking-widest mb-4">Next Step</h3>
                        
                        {selectedOrder.status === 'confirmed' && (
                          <div className="space-y-3 mb-4">
                            <label className="text-xs font-bold text-leather-700 uppercase">Tracking ID / Link</label>
                            <input 
                              type="text"
                              value={trackingLink}
                              onChange={(e) => setTrackingLink(e.target.value)}
                              placeholder="Enter tracking ID or link..."
                              className="w-full px-4 py-3 bg-white border border-leather-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-3">
                          {getNextStatus(selectedOrder.status) && (
                            <button
                              onClick={() => updateStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!.id)}
                              className="flex items-center justify-center space-x-2 p-4 rounded-2xl bg-gold-500 text-leather-900 font-bold hover:bg-gold-600 transition-all shadow-lg shadow-gold-500/20"
                            >
                              {getNextStatus(selectedOrder.status)!.icon}
                              <span>{getNextStatus(selectedOrder.status)!.label} & Save</span>
                            </button>
                          )}
                          
                          <button
                            onClick={() => updateStatus(selectedOrder.id, 'cancelled')}
                            className="flex items-center justify-center space-x-2 p-4 rounded-2xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 transition-all"
                          >
                            <span>Cancel Order</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-8 border-t border-leather-50">
                    <a 
                      href={`https://wa.me/${selectedOrder.customer.phone.replace(/^0/, '880')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center space-x-3 py-4 bg-gold-50 text-gold-700 rounded-2xl font-bold hover:bg-gold-100 transition-all"
                    >
                      <MessageCircle size={20} />
                      <span>CHAT ON WHATSAPP</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedOrder && (
        <InvoiceModal 
          order={selectedOrder}
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
        />
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
