import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { trackEvent, generateEventId } from '../utils/pixel';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-stone-100 rounded-full mb-6 text-stone-400">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-bold text-stone-900 mb-4">Your cart is empty</h2>
        <p className="text-stone-500 mb-8 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet. Explore our premium leather collection.
        </p>
        <Link 
          to="/shop" 
          className="inline-flex items-center space-x-2 bg-stone-900 text-white px-8 py-4 rounded-full font-bold hover:bg-stone-800 transition-all"
        >
          <span>START SHOPPING</span>
          <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-stone-900 mb-10">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item, idx) => (
            <motion.div 
              key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col sm:flex-row gap-6 items-center"
            >
              <img 
                src={item.images[0]} 
                alt={item.name} 
                className="w-32 h-32 object-cover rounded-xl bg-stone-50"
              />
              <div className="flex-grow text-center sm:text-left">
                <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">{item.category}</div>
                <h3 className="text-lg font-bold text-stone-900 mb-1">{item.name}</h3>
                <div className="text-sm text-stone-500 mb-4">
                  {item.selectedSize && <span className="mr-4">Size: <span className="text-stone-900 font-semibold">{item.selectedSize}</span></span>}
                  {item.selectedColor && <span>Color: <span className="text-stone-900 font-semibold">{item.selectedColor}</span></span>}
                </div>
                <div className="flex items-center justify-center sm:justify-start space-x-4">
                  <div className="flex items-center bg-stone-100 rounded-lg p-1">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                      className="p-1 hover:bg-white rounded transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 font-bold text-sm w-8 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                      className="p-1 hover:bg-white rounded transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                    className="text-stone-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="text-xl font-bold text-stone-900">
                ৳{(item.price * item.quantity).toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 sticky top-24 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 mb-6">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">৳{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span className="text-sm font-medium text-stone-500 italic">Calculated at checkout</span>
              </div>
              <div className="border-t border-stone-100 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-stone-900">Total</span>
                <span className="text-2xl font-bold text-stone-900">৳{cartTotal.toLocaleString()}</span>
              </div>
            </div>
            <button 
              onClick={() => {
                const eventId = generateEventId();
                trackEvent('InitiateCheckout', {
                  num_items: cart.length,
                  value: cartTotal,
                  currency: 'BDT',
                  content_ids: cart.map(item => item.id),
                  content_type: 'product'
                }, eventId);

                // CAPI InitiateCheckout
                axios.post('/api/facebook-capi', {
                  eventName: 'InitiateCheckout',
                  eventId,
                  customData: {
                    num_items: cart.length,
                    value: cartTotal,
                    currency: 'BDT',
                    content_ids: cart.map(item => item.id),
                    content_type: 'product'
                  }
                }).catch(err => console.error('CAPI InitiateCheckout Error:', err));

                navigate('/checkout');
              }}
              className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all flex items-center justify-center space-x-2"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight size={20} />
            </button>
            <div className="mt-6 text-center">
              <Link to="/shop" className="text-sm text-stone-500 hover:text-stone-900 transition-colors font-medium">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
