import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, LayoutGrid, List } from 'lucide-react';
import { motion } from 'framer-motion';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Chelsea Boot', 'Loafer Shoe', 'Oxford Shoe', 'Casual Shoe', 'Sandals', 'Wallets', 'Belts', 'Bags'];

  useEffect(() => {
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="space-y-8">
        {/* Search and Categories Section */}
        <div className="space-y-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input 
              type="text"
              placeholder="Search premium leather products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-leather-500 text-base shadow-sm"
            />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all border text-center flex items-center justify-center min-h-[40px] ${
                  selectedCategory === cat 
                    ? 'bg-leather-900 border-leather-900 text-white shadow-md shadow-leather-900/10' 
                    : 'bg-white border-stone-200 text-stone-600 hover:border-leather-400 hover:text-leather-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-end">
          <div className="flex bg-stone-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-400'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-400'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[4/5] bg-stone-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredProducts.map(product => (
                viewMode === 'grid' ? (
                  <ProductCard key={product.id} product={product} />
                ) : (
                  <motion.div 
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-4 rounded-2xl border border-stone-200 flex gap-6 items-center"
                  >
                    <img src={product.images[0]} alt={product.name} className="w-24 h-24 object-cover rounded-xl" />
                    <div className="flex-grow">
                      <div className="text-xs text-stone-500 uppercase tracking-wider">{product.category}</div>
                      <h3 className="font-bold text-stone-900">{product.name}</h3>
                      <div className="text-lg font-bold text-stone-900">৳{product.price.toLocaleString()}</div>
                    </div>
                    <Link to={`/product/${product.id}`} className="px-6 py-2 bg-stone-900 text-white rounded-full hover:bg-emerald-600 transition-colors">
                      View
                    </Link>
                  </motion.div>
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-stone-400 mb-4"><Search size={48} className="mx-auto" /></div>
              <h3 className="text-xl font-bold text-stone-900">No products found</h3>
              <p className="text-stone-500">Try adjusting your search or filters</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default Shop;
