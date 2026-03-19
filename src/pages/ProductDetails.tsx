import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Check, Truck, ShieldCheck, RefreshCw, Minus, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { trackEvent, generateEventId } from '../utils/pixel';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(productData);
          if (docSnap.data().sizes?.length > 0) setSelectedSize(docSnap.data().sizes[0]);
          if (docSnap.data().colors?.length > 0) setSelectedColor(docSnap.data().colors[0]);

          // Track ViewContent
          const eventId = generateEventId();
          trackEvent('ViewContent', {
            content_name: productData.name,
            content_ids: [productData.id],
            content_type: 'product',
            value: productData.price,
            currency: 'BDT'
          }, eventId);

          // CAPI ViewContent
          axios.post('/api/facebook-capi', {
            eventName: 'ViewContent',
            eventId,
            customData: {
              content_name: productData.name,
              content_ids: [productData.id],
              content_type: 'product',
              value: productData.price,
              currency: 'BDT'
            }
          }).catch(err => console.error('CAPI ViewContent Error:', err));
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square bg-stone-200 rounded-3xl" />
        <div className="space-y-6">
          <div className="h-8 bg-stone-200 w-3/4 rounded" />
          <div className="h-6 bg-stone-200 w-1/4 rounded" />
          <div className="h-32 bg-stone-200 w-full rounded" />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold">Product not found</h2>
      <button onClick={() => navigate('/shop')} className="mt-4 text-emerald-600">Back to Shop</button>
    </div>
  );

  const handleAddToCart = (buyNow = false) => {
    if (!product) return;
    
    addToCart(product, quantity, selectedSize, selectedColor);
    
    const eventId = generateEventId();

    // Track AddToCart
    trackEvent('AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price * quantity,
      currency: 'BDT'
    }, eventId);

    // CAPI AddToCart
    axios.post('/api/facebook-capi', {
      eventName: 'AddToCart',
      eventId,
      customData: {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price * quantity,
        currency: 'BDT'
      }
    }).catch(err => console.error('CAPI AddToCart Error:', err));

    if (buyNow) navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-stone-100 border border-stone-200">
            <img 
              src={product.images[activeImage]} 
              alt={product.name} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {product.images.length > 1 && (
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                <button 
                  onClick={() => setActiveImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                  className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg pointer-events-auto hover:bg-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setActiveImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                  className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg pointer-events-auto hover:bg-white"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === idx ? 'border-emerald-600 scale-105' : 'border-transparent opacity-70'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-8">
          <div>
            <div className="text-sm text-stone-500 uppercase tracking-widest mb-2">{product.category}</div>
            <h1 className="text-4xl font-bold text-stone-900 tracking-tight mb-4">{product.name}</h1>
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-stone-900">৳{product.price.toLocaleString()}</span>
              {product.inStock ? (
                <span className="flex items-center space-x-1 text-emerald-600 text-sm font-semibold bg-emerald-50 px-3 py-1 rounded-full">
                  <Check size={14} />
                  <span>In Stock</span>
                </span>
              ) : (
                <span className="text-red-600 text-sm font-semibold bg-red-50 px-3 py-1 rounded-full">Out of Stock</span>
              )}
            </div>
          </div>

          <div 
            className="prose prose-stone max-w-none text-stone-600 product-description"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />

          {/* Options */}
          <div className="space-y-6 pt-6 border-t border-stone-200">
            {product.sizes?.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-stone-900 mb-3 uppercase tracking-wider">Select Size</label>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-2 rounded-xl border-2 transition-all font-medium ${
                        selectedSize === size 
                          ? 'border-stone-900 bg-stone-900 text-white' 
                          : 'border-stone-200 text-stone-600 hover:border-stone-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors?.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-stone-900 mb-3 uppercase tracking-wider">Select Color</label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 py-2 rounded-xl border-2 transition-all font-medium ${
                        selectedColor === color 
                          ? 'border-stone-900 bg-stone-900 text-white' 
                          : 'border-stone-200 text-stone-600 hover:border-stone-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center justify-between bg-stone-100 rounded-xl p-1 h-12 md:h-14">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 sm:p-3 hover:bg-white rounded-lg transition-colors flex-1 sm:flex-none flex justify-center"
                >
                  <Minus size={18} />
                </button>
                <span className="px-4 font-bold w-12 text-center text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 sm:p-3 hover:bg-white rounded-lg transition-colors flex-1 sm:flex-none flex justify-center"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="flex-grow flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button 
                  onClick={() => handleAddToCart()}
                  disabled={!product.inStock}
                  className="flex-grow bg-leather-900 text-white py-3 md:py-4 rounded-xl font-bold hover:bg-leather-800 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-leather-900/20"
                >
                  <ShoppingCart size={20} />
                  <span>{product.inStock ? 'ADD TO CART' : 'OUT OF STOCK'}</span>
                </button>
                <button 
                  onClick={() => handleAddToCart(true)}
                  disabled={!product.inStock}
                  className="flex-grow bg-emerald-600 text-white py-3 md:py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20"
                >
                  BUY NOW
                </button>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-stone-200">
            <div className="flex flex-col items-center text-center space-y-2">
              <Truck size={24} className="text-stone-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <ShieldCheck size={24} className="text-stone-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Genuine Leather</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <RefreshCw size={24} className="text-stone-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">7-Day Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
