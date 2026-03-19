import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Order } from '../types';
import { 
  Calendar, TrendingUp, ShoppingBag, 
  CheckCircle, Truck, Filter, Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, isSameMonth, parseISO } from 'date-fns';
import AdminLayout from '../components/AdminLayout';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

interface MonthlyStats {
  month: string;
  year: string;
  monthKey: string;
  totalOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  deliveredRevenue: number;
}

const AdminHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const monthlyHistory = useMemo(() => {
    const history: Record<string, MonthlyStats> = {};

    orders.forEach(order => {
      const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
      const monthKey = format(date, 'yyyy-MM');
      const monthName = format(date, 'MMMM');
      const year = format(date, 'yyyy');

      if (!history[monthKey]) {
        history[monthKey] = {
          month: monthName,
          year: year,
          monthKey: monthKey,
          totalOrders: 0,
          shippedOrders: 0,
          deliveredOrders: 0,
          deliveredRevenue: 0
        };
      }

      history[monthKey].totalOrders += 1;
      if (order.status === 'shipped') history[monthKey].shippedOrders += 1;
      if (order.status === 'delivered') {
        history[monthKey].deliveredOrders += 1;
        history[monthKey].deliveredRevenue += order.total;
      }
    });

    return Object.values(history).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [orders]);

  const years = useMemo(() => {
    const uniqueYears = Array.from(new Set(monthlyHistory.map(h => h.year)));
    return uniqueYears.sort((a, b) => b.localeCompare(a));
  }, [monthlyHistory]);

  const filteredHistory = useMemo(() => {
    if (selectedYear === 'All') return monthlyHistory;
    return monthlyHistory.filter(h => h.year === selectedYear);
  }, [monthlyHistory, selectedYear]);

  const chartData = useMemo(() => {
    return [...filteredHistory].reverse().map(h => ({
      name: `${h.month.substring(0, 3)} ${h.year}`,
      Orders: h.totalOrders,
      Delivered: h.deliveredOrders,
      Revenue: h.deliveredRevenue / 100 // Scaled for better visualization if needed, but let's keep it real
    }));
  }, [filteredHistory]);

  return (
    <AdminLayout title="Monthly History">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white border border-leather-200 rounded-xl px-4 py-2 flex items-center gap-2">
            <Filter size={18} className="text-leather-400" />
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent focus:outline-none font-bold text-leather-900"
            >
              <option value="All">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-3xl border border-leather-100 shadow-sm mb-10">
        <h3 className="text-lg font-bold text-leather-900 mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-gold-600" />
          Performance Overview
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Bar dataKey="Orders" fill="#1c1917" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Delivered" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-leather-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-leather-50 text-leather-400 text-xs font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Month / Year</th>
                <th className="px-6 py-4">Total Orders</th>
                <th className="px-6 py-4">Shipped</th>
                <th className="px-6 py-4">Delivered</th>
                <th className="px-6 py-4 text-right">Delivered Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-leather-50">
              {filteredHistory.map((stat, idx) => (
                <motion.tr 
                  key={stat.monthKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-leather-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-leather-100 rounded-xl flex items-center justify-center text-leather-600">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-leather-900">{stat.month}</div>
                        <div className="text-xs text-leather-400">{stat.year}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={16} className="text-leather-400" />
                      <span className="font-bold text-leather-900">{stat.totalOrders}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-purple-500" />
                      <span className="font-bold text-leather-900">{stat.shippedOrders}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-500" />
                      <span className="font-bold text-leather-900">{stat.deliveredOrders}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-lg font-bold text-gold-600">৳{stat.deliveredRevenue.toLocaleString()}</div>
                  </td>
                </motion.tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-leather-400">
                    No history data available.
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

export default AdminHistory;
