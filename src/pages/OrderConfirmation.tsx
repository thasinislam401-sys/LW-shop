import React, { useEffect, useState } from 'react';
import { Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderNumber } = location.state || {};
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!orderNumber) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/shop');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderNumber, navigate]);

  if (!orderNumber) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-[2rem] border border-stone-200 shadow-2xl shadow-stone-200/50 overflow-hidden"
        >
          {/* Banner Header */}
          <div className="bg-emerald-500 p-8 text-white text-center relative overflow-hidden">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.2 }}
              className="relative z-10 inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-4"
            >
              <CheckCircle2 size={40} className="text-white" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold relative z-10 leading-tight">
              ধন্যবাদ! আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে 🎉
            </h1>
            {/* Decorative circles */}
            <div className="absolute top-[-20%] left-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          </div>

          {/* Banner Body */}
          <div className="p-8 md:p-12 text-center space-y-6">
            <div className="space-y-4 text-stone-600 text-lg">
              <p className="font-medium text-stone-800">
                Leather Wallah-কে বেছে নেওয়ার জন্য আপনাকে আন্তরিক ধন্যবাদ।
              </p>
              <p>আমাদের টিম ইতোমধ্যে আপনার অর্ডারটি প্রসেস করা শুরু করেছে।</p>
              
              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 text-left space-y-3 mx-auto max-w-md">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📦</span>
                  <p className="text-sm md:text-base">খুব শীঘ্রই আপনার দেওয়া নম্বরে কনফার্মেশন কল করা হবে।</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🚚</span>
                  <p className="text-sm md:text-base">আপনি 'Orders' পেজ থেকে আপনার পার্সেল ট্র্যাক করতে পারবেন।</p>
                </div>
              </div>
              
              <p className="font-bold text-stone-900 pt-2">
                আপনার ভরসাই আমাদের অনুপ্রেরণা। 💼
              </p>
            </div>

            <div className="pt-6 flex flex-col items-center gap-4">
              <div className="text-sm text-stone-400 font-medium">
                অর্ডার নম্বর: <span className="text-stone-900 font-bold">#{orderNumber}</span>
              </div>
              
              <Link 
                to="/shop" 
                className="group w-full max-w-xs flex items-center justify-center space-x-3 bg-stone-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20 active:scale-95"
              >
                <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
                <span>SHOP MORE</span>
              </Link>

              <div className="text-xs text-stone-400 italic">
                {countdown} সেকেন্ডের মধ্যে আপনাকে শপে ফিরিয়ে নিয়ে যাওয়া হবে...
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <Link 
            to="/orders" 
            className="inline-flex items-center space-x-2 text-stone-500 hover:text-stone-900 font-bold transition-colors"
          >
            <Package size={18} />
            <span>আমার অর্ডারগুলো দেখুন</span>
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
