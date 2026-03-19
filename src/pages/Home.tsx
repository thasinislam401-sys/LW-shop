import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import CategorySlider from '../components/CategorySlider';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(
          collection(db, 'products'), 
          where('featured', '==', true),
          where('inStock', '==', true),
          limit(4)
        );
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      <CategorySlider />

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8 md:mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-leather-900 font-serif">Featured Products</h2>
            <p className="text-sm md:text-base text-leather-500">Our most loved leather essentials</p>
          </div>
          <Link to="/shop" className="text-gold-600 text-sm md:text-base font-bold hover:text-gold-700 flex items-center space-x-1 group">
            <span>View All</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[4/5] bg-leather-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { icon: <Award className="text-gold-600 w-5 h-5 md:w-6 md:h-6" />, title: "Premium Quality", desc: "100% genuine" },
            { icon: <ShieldCheck className="text-gold-600 w-5 h-5 md:w-6 md:h-6" />, title: "Secure Payment", desc: "Safe & trusted" },
            { icon: <Truck className="text-gold-600 w-5 h-5 md:w-6 md:h-6" />, title: "Fast Delivery", desc: "Across BD" },
            { icon: <RefreshCw className="text-gold-600 w-5 h-5 md:w-6 md:h-6" />, title: "Easy Returns", desc: "7-day policy" }
          ].map((benefit, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-4 md:p-6 bg-white rounded-xl md:rounded-2xl border border-leather-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-3 md:mb-4 p-2 md:p-3 bg-leather-50 rounded-full">{benefit.icon}</div>
              <h3 className="text-xs md:text-sm font-bold text-leather-900 mb-1 font-serif">{benefit.title}</h3>
              <p className="text-[10px] md:text-xs text-leather-500">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
