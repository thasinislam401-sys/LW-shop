import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../CartContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Truck, ArrowLeft, Loader2, CheckCircle2, ShoppingBag, Home, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { trackEvent, generateEventId } from '../utils/pixel';

const SuccessModal = ({ orderNumber, onClose }: { orderNumber: string, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden"
      >
        <div className="bg-emerald-600 p-8 text-center text-white">
          <div className="flex justify-center mb-4">
            <CheckCircle2 size={64} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Thank you, Your Order is Confirmed</h2>
          <p className="text-emerald-50 opacity-90">Order ID: #{orderNumber}</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <p className="text-stone-700 leading-relaxed font-medium">
              LeatherWallah-এ অর্ডার দেওয়ার জন্য ধন্যবাদ। আমরা আপনার অর্ডার গ্রহণ করেছি এবং শিগগিরই ফোন করে নিশ্চিত করব।
            </p>
            <p className="text-stone-600 text-sm">
              আপনি চাইলে আপনার অর্ডারের অগ্রগতি দেখতে 'Orders' পেজে যেতে পারেন।
            </p>
          </div>

          <div className="space-y-3">
            <Link 
              to="/orders"
              className="w-full flex items-center justify-center space-x-2 py-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold hover:bg-emerald-100 transition-all"
            >
              <ExternalLink size={18} />
              <span>অর্ডার ট্র্যাক করুন (Track Order)</span>
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <Link 
                to="/shop"
                className="flex items-center justify-center space-x-2 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all"
              >
                <ShoppingBag size={18} />
                <span>Shop More</span>
              </Link>
              <Link 
                to="/"
                className="flex items-center justify-center space-x-2 py-4 border-2 border-stone-200 text-stone-600 rounded-2xl font-bold hover:bg-stone-50 transition-all"
              >
                <Home size={18} />
                <span>Go to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');
  const [shippingCharge, setShippingCharge] = useState(70); // Default to Inside Dhaka
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    district: '',
    thana: '',
    village: ''
  });

  const finalTotal = cartTotal + shippingCharge;

  if (cart.length === 0 && !showSuccess) {
    navigate('/shop');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderNumber = 'LW' + Math.floor(100000 + Math.random() * 900000);
      const orderData = {
        orderNumber,
        customer: {
          name: formData.name,
          phone: formData.phone,
          whatsapp: formData.whatsapp || '',
          address: {
            district: formData.district,
            thana: formData.thana,
            village: formData.village
          }
        },
        items: cart.map(item => {
          const itemData: any = {
            productId: item.id,
            name: item.name,
            price: item.price,
            qty: item.quantity
          };
          if (item.selectedSize) itemData.size = item.selectedSize;
          if (item.selectedColor) itemData.color = item.selectedColor;
          return itemData;
        }),
        total: finalTotal,
        shippingCharge,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      // Save to Firebase
      const docRef = await addDoc(collection(db, 'orders'), orderData);

      const eventId = generateEventId();

      // Track Purchase with Meta Pixel
      trackEvent('Purchase', {
        value: finalTotal,
        currency: 'BDT',
        content_ids: cart.map(i => i.id),
        content_type: 'product',
        num_items: cart.length
      }, eventId);

      // Trigger Facebook CAPI
      try {
        await axios.post('/api/facebook-capi', {
          eventName: 'Purchase',
          eventId,
          userData: {
            fn: formData.name,
            ph: formData.phone,
            ct: formData.district,
            zp: formData.thana
          },
          customData: {
            value: finalTotal,
            currency: 'BDT',
            content_ids: cart.map(i => i.id),
            content_type: 'product'
          }
        });
      } catch (capiError) {
        console.error('CAPI Error:', capiError);
      }

      setPlacedOrderNumber(orderNumber);
      setShowSuccess(true);
      clearCart();

    } catch (error) {
      console.error('Order error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <AnimatePresence>
        {showSuccess && (
          <SuccessModal 
            orderNumber={placedOrderNumber} 
            onClose={() => setShowSuccess(false)} 
          />
        )}
      </AnimatePresence>
      <button 
        onClick={() => navigate('/cart')}
        className="flex items-center space-x-2 text-stone-500 hover:text-stone-900 mb-8 transition-colors"
      >
        <ArrowLeft size={18} />
        <span>Back to Cart</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Checkout Form */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
            <h2 className="text-2xl font-bold text-stone-900 mb-8">আপনার তথ্য দিয়ে CONFIRM Order বাটনে চাপ দিন </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Full Name</label>
                  <input 
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Phone Number</label>
                  <input 
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">WhatsApp Number (Optional)</label>
                <input 
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="Same as phone or different"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">District (জেলা)</label>
                  <input 
                    required
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder="e.g. Dhaka"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Thana (থানা)</label>
                  <input 
                    required
                    name="thana"
                    value={formData.thana}
                    onChange={handleInputChange}
                    placeholder="e.g. Dhanmondi"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Village / Area / House (গ্রাম বা এলাকা)</label>
                <input 
                  required
                  name="village"
                  value={formData.village}
                  onChange={handleInputChange}
                  placeholder="Full address details"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Shipping Area</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <label className={`flex items-center justify-between p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${shippingCharge === 70 ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 bg-stone-50'}`}>
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <input 
                        type="radio" 
                        name="shipping" 
                        checked={shippingCharge === 70}
                        onChange={() => setShippingCharge(70)}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span className="font-bold text-stone-900 text-sm md:text-base">ঢাকার ভিতরে</span>
                    </div>
                    <span className="font-bold text-emerald-600 text-sm md:text-base">৳70</span>
                  </label>
                  <label className={`flex items-center justify-between p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${shippingCharge === 130 ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 bg-stone-50'}`}>
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <input 
                        type="radio" 
                        name="shipping" 
                        checked={shippingCharge === 130}
                        onChange={() => setShippingCharge(130)}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span className="font-bold text-stone-900 text-sm md:text-base">ঢাকার বাহিরে</span>
                    </div>
                    <span className="font-bold text-emerald-600 text-sm md:text-base">৳130</span>
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>PLACING ORDER...</span>
                    </>
                  ) : (
                    <span>CONFIRM ORDER (৳{finalTotal.toLocaleString()})</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-8">
          <div className="bg-stone-50 p-8 rounded-3xl border border-stone-200">
            <h2 className="text-xl font-bold text-stone-900 mb-6">Your Order</h2>
            <div className="space-y-4 mb-8">
              {cart.map(item => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img src={item.images[0]} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                      <span className="absolute -top-2 -right-2 bg-stone-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.quantity}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-stone-900 text-sm">{item.name}</div>
                      <div className="text-xs text-stone-500">
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                        {item.selectedColor && ` | Color: ${item.selectedColor}`}
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900">৳{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-200 pt-4 space-y-2">
              <div className="flex justify-between text-stone-600 text-sm">
                <span>Subtotal</span>
                <span>৳{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-600 text-sm">
                <span>Shipping</span>
                <span className="text-stone-900 font-semibold">৳{shippingCharge}</span>
              </div>
              <div className="flex justify-between text-stone-900 font-bold text-xl pt-2">
                <span>Total</span>
                <span>৳{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 space-y-4">
            <div className="flex items-center space-x-3 text-emerald-800">
              <ShieldCheck size={20} />
              <span className="font-semibold">Secure Checkout</span>
            </div>
            <div className="flex items-center space-x-3 text-emerald-800">
              <Truck size={20} />
              <span className="font-semibold">Fast Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
